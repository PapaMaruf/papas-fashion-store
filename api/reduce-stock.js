const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cartItems, items } = req.body;
    
    // Support both cartItems and items field names
    const itemsToProcess = cartItems || items;
    
    console.log('Processing stock reduction for cart items:', itemsToProcess);
    
    // Note: In production, you'd want to use a database instead of JSON files
    // For now, we'll simulate the stock reduction logic
    
    const reductions = [];
    
    for (const item of itemsToProcess) {
      try {
        console.log(`Processing item for stock reduction:`, {
          name: item.name,
          color: item.color,
          size: item.size,
          qty: item.qty
        });
        
        // Simulate stock reduction
        reductions.push({
          item: `${item.name} (${item.color}) - Size ${item.size}`,
          quantity: item.qty || item.quantity || 1,
          oldStock: 10, // Simulated
          newStock: 9,  // Simulated
          success: true
        });
        
        console.log(`Stock simulated: ${item.name} size ${item.size} by ${item.qty || 1}`);
      } catch (error) {
        console.error('Error reducing stock for item:', item, error);
        reductions.push({
          item: item.name,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('Stock reduction completed:', reductions);
    res.json({ success: true, reductions: reductions, note: 'Stock reduction simulated - use database in production' });
    
  } catch (error) {
    console.error('Error processing stock reduction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
