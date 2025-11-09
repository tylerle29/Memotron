import { supabase } from '../lib/supabaseClient'

async function checkUploads() {
  console.log('Ì¥ç Checking Supabase upload configuration...\n')
  
  // 1. Test connection
  console.log('1Ô∏è‚É£ Testing connection...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) throw error
    console.log('‚úÖ Connected successfully!')
    console.log('Ì≥¶ Available buckets:', buckets.map(b => b.name).join(', '))
  } catch (err) {
    console.error('‚ùå Connection failed:', err)
    return
  }
  
  console.log()
  
  // 2. Check meme-images bucket
  console.log('2Ô∏è‚É£ Checking meme-images bucket...')
  try {
    const { data: files, error } = await supabase.storage
      .from('meme-images')
      .list('memes', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } })
    
    if (error) throw error
    
    console.log(`‚úÖ Bucket accessible!`)
    console.log(`Ì≥Ç Current files: ${files.length}`)
    
    if (files.length > 0) {
      console.log('\nRecent uploads:')
      files.slice(0, 5).forEach((file, i) => {
        const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) : 'unknown'
        console.log(`  ${i + 1}. ${file.name} (${size} KB)`)
      })
    } else {
      console.log('   No files yet - upload a meme to test!')
    }
  } catch (err: any) {
    console.error('‚ùå Bucket check failed:', err.message)
  }
  
  console.log()
  
  // 3. Test upload
  console.log('3Ô∏è‚É£ Testing upload capability...')
  try {
    const testContent = `Test at ${new Date().toISOString()}`
    const testPath = `test/test-${Date.now()}.txt`
    
    const { data, error } = await supabase.storage
      .from('meme-images')
      .upload(testPath, testContent)
    
    if (error) throw error
    
    console.log('‚úÖ Test upload successful!')
    console.log('   Path:', data.path)
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('meme-images')
      .getPublicUrl(data.path)
    
    console.log('   URL:', urlData.publicUrl)
    
    // Clean up
    await supabase.storage.from('meme-images').remove([testPath])
    console.log('   Cleaned up test file ‚úì')
    
  } catch (err: any) {
    console.error('‚ùå Upload test failed:', err.message)
  }
  
  console.log('\n‚úÖ Check complete!')
}

checkUploads()
