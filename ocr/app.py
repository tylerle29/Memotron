from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import vision
from dotenv import load_dotenv
import io
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for testing

# Verify credentials are set
if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
    print("WARNING: GOOGLE_APPLICATION_CREDENTIALS not set!")
else:
    print(f"Using credentials: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")

@app.route('/')
def home():
    return jsonify({
        'status': 'OCR API is running',
        'endpoints': {
            'POST /api/ocr': 'Upload image for OCR processing',
            'POST /api/ocr/document': 'Force document text detection',
            'POST /api/ocr/text': 'Force text detection'
        }
    })

def extract_bounding_box(vertices):
    """Extract bounding box coordinates from vertices"""
    return {
        'vertices': [{'x': v.x, 'y': v.y} for v in vertices]
    }

def process_document_text_detection(image_bytes):
    """Process using DOCUMENT_TEXT_DETECTION - optimized for dense text/documents"""
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.document_text_detection(image=image)
    
    if response.error.message:
        return None, response.error.message
    
    result = {
        'detection_type': 'DOCUMENT_TEXT_DETECTION',
        'pages': []
    }
    
    # Extract detailed page structure with hierarchical information
    if response.full_text_annotation:
        for page in response.full_text_annotation.pages:
            page_data = {
                'width': page.width,
                'height': page.height,
                'blocks': []
            }
            
            for block in page.blocks:
                block_data = {
                    'block_type': vision.Block.BlockType(block.block_type).name,
                    'paragraphs': []
                }
                
                for paragraph in block.paragraphs:
                    paragraph_data = {
                        'words': []
                    }
                    
                    for word in paragraph.words:
                        # Reconstruct word text from symbols
                        word_text = ''.join([symbol.text for symbol in word.symbols])
                        
                        # Get break type from last symbol if present
                        break_type = None
                        if word.symbols and word.symbols[-1].property.detected_break:
                            break_type = vision.TextAnnotation.DetectedBreak.BreakType(
                                word.symbols[-1].property.detected_break.type
                            ).name
                        
                        word_data = {
                            'text': word_text
                        }
                        
                        if break_type:
                            word_data['break'] = break_type
                        
                        paragraph_data['words'].append(word_data)
                    
                    block_data['paragraphs'].append(paragraph_data)
                
                page_data['blocks'].append(block_data)
            
            result['pages'].append(page_data)
    
    return result, None

def process_text_detection(image_bytes):
    """Process using TEXT_DETECTION - for any image with text (signs, photos, etc)"""
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.text_detection(image=image)
    
    if response.error.message:
        return None, response.error.message
    
    texts = response.text_annotations
    
    if not texts:
        return {
            'detection_type': 'TEXT_DETECTION',
            'full_text': {
                'text': "",
                'bounding_box': None
            },
            'words': []
        }, None
    
    result = {
        'detection_type': 'TEXT_DETECTION',
        'full_text': {
            'text': texts[0].description,
            'bounding_box': extract_bounding_box(texts[0].bounding_poly.vertices)
        },
        'words': []
    }
    
    # Rest of text_annotations are individual words with bounding boxes
    for text in texts[1:]:
        result['words'].append({
            'text': text.description,
            'bounding_box': extract_bounding_box(text.bounding_poly.vertices)
        })
    
    return result, None

def auto_detect_method(image_bytes):
    """Automatically choose best detection method based on text density"""
    # First, do a quick text detection to assess density
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.text_detection(image=image)
    
    if not response.text_annotations:
        # No text found, use TEXT_DETECTION anyway
        return 'text'
    
    # Calculate text density heuristic
    full_text = response.text_annotations[0].description if response.text_annotations else ""
    num_words = len(full_text.split())
    
    # If more than 50 words, likely a document; otherwise likely sparse text
    if num_words > 50:
        return 'document'
    else:
        return 'text'

@app.route('/api/ocr', methods=['POST'])
def ocr_image():
    """Auto-detect best OCR method"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
    file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}), 400

    try:
        image_bytes = file.read()
        
        # Auto-detect best method
        method = auto_detect_method(image_bytes)
        
        if method == 'document':
            result, error = process_document_text_detection(image_bytes)
        else:
            result, error = process_text_detection(image_bytes)
        
        if error:
            return jsonify({'error': error}), 500
        
        # Add metadata
        result['success'] = True
        if 'extracted_string' in result:
            result['character_count'] = len(result['extracted_string'])
            result['word_count'] = len(result['words'])
        
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }), 500

@app.route('/api/ocr/document', methods=['POST'])
def ocr_document():
    """Force DOCUMENT_TEXT_DETECTION method"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    
    try:
        image_bytes = file.read()
        result, error = process_document_text_detection(image_bytes)
        
        if error:
            return jsonify({'error': error}), 500
        
        result['success'] = True
        
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }), 500

@app.route('/api/ocr/text', methods=['POST'])
def ocr_text():
    """Force TEXT_DETECTION method"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    
    try:
        image_bytes = file.read()
        result, error = process_text_detection(image_bytes)
        
        if error:
            return jsonify({'error': error}), 500
        
        result['success'] = True
        result['character_count'] = len(result['extracted_string'])
        result['word_count'] = len(result['words'])
        
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)