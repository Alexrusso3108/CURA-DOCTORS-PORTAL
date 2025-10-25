// Test file to verify Supabase connection and check doctors table structure
import { supabase } from '../lib/supabaseClient'

export async function testConnection() {
  try {
    // Test connection by fetching doctors
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error connecting to Supabase:', error)
      return { success: false, error }
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Sample doctor record:', data)
    console.log('Available columns:', data.length > 0 ? Object.keys(data[0]) : 'No records found')
    
    return { success: true, data }
  } catch (err) {
    console.error('Connection test failed:', err)
    return { success: false, error: err }
  }
}

// Run test if this file is imported
testConnection()
