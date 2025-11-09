import { supabase } from '../lib/supabaseClient'

async function testConnection() {
    try {
        const { data, error } = await supabase.from('analyses').select('count(*)');
        console.log('[Test] Supabase connection:', { data, error });
        
        // test storage bucket
        const { data: bucket } = await supabase.storage.getBucket('images');
        console.log('[Test] Storage bucket:', bucket);
    } catch (err) {
        console.error('[Test] Error:', err);
    }
}

testConnection();
