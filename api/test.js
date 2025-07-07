// Test endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Papa\'s Fashion API is running on Vercel!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
}
