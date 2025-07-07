// Simple test endpoint to verify API is working
export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('API Debug endpoint called');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  
  res.status(200).json({ 
    message: 'Papa\'s Fashion API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    method: req.method,
    endpoint: 'debug',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    hostname: req.headers.host,
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    referer: req.headers.referer
  });
}
