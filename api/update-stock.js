const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stockConfig = req.body;
    
    console.log('Updating stock configuration...');
    
    // In Vercel, we need to handle file paths differently
    // For now, we'll return success but note that file updates won't persist
    // You'll need to update stock via your admin panel or database
    
    console.log('Stock configuration received:', stockConfig);
    res.json({ success: true, message: 'Stock configuration received (Note: File updates do not persist on Vercel)' });
    
  } catch (error) {
    console.error('Error updating stock configuration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
