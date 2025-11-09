from bs4 import BeautifulSoup
import requests
from urllib.parse import quote

def kym_search_image(query):
    url = f"https://knowyourmeme.com/search?q={quote(query)}"
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(r.text, "html.parser")

    # select the first img that has a data-image attribute
    img_tag = soup.select_one("img[data-image]")
    if not img_tag:
        print("No image found")
        return None

    # get the original image url from data-image
    img_url = img_tag.get("data-image")
    return img_url

if __name__ == "__main__":
    img_url = kym_search_image("One does not simply")
    print(img_url)
