const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sending function
async function sendConfirmationEmail(customerInfo, orderDetails, cartItems) {
  try {
    const itemsHtml = cartItems && cartItems.length > 0 
      ? cartItems.map(item => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.color}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">€${item.price || (item.name.toLowerCase().includes('asics') ? '84.95' : '49.95')}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" style="padding: 10px; text-align: center;">Order details not available</td></tr>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .order-table th { background-color: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
            .total { font-weight: bold; font-size: 1.2em; color: #667eea; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛍️ Papa's Fashion</h1>
            <p>Order Confirmation</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your order, ${customerInfo.customer_name}!</h2>
            <p>We're excited to confirm that your order has been successfully processed.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails.id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderDetails.created * 1000).toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> ${orderDetails.payment_status}</p>
            
            <h3>Billing Information:</h3>
            <p><strong>Name:</strong> ${customerInfo.customer_name}</p>
            <p><strong>Email:</strong> ${customerInfo.customer_email}</p>
            <p><strong>Phone:</strong> ${customerInfo.customer_phone}</p>
            <p><strong>Address:</strong> ${customerInfo.customer_address}</p>
            <p><strong>City:</strong> ${customerInfo.customer_city}, ${customerInfo.customer_postal_code}</p>
            <p><strong>Country:</strong> ${customerInfo.customer_country}</p>
            
            <h3>Items Ordered:</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            ${orderDetails.metadata?.shipping_cost && parseFloat(orderDetails.metadata.shipping_cost) > 0 ? 
              `<p><strong>Subtotal:</strong> €${orderDetails.metadata.subtotal || ((orderDetails.amount_total / 100) - parseFloat(orderDetails.metadata.shipping_cost)).toFixed(2)}</p>
               <p><strong>Shipping:</strong> €${parseFloat(orderDetails.metadata.shipping_cost).toFixed(2)}</p>` : 
              '<p><strong>Shipping:</strong> FREE</p>'
            }
            <p class="total">Total: €${(orderDetails.amount_total / 100).toFixed(2)}</p>
            
            <h3>What's Next?</h3>
            <p>• Your order is being processed and will be shipped within 2-3 business days</p>
            <p>• You'll receive a shipping confirmation email with tracking information</p>
            <p>• If you have any questions, please contact us at info.papasfashion@gmail.com</p>
            
            <p>Thank you for choosing Papa's Fashion!</p>
          </div>
          
          <div class="footer">
            <p>Papa's Fashion - Premium Fashion for the Modern Individual</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "Papa's Fashion"} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: customerInfo.customer_email,
      subject: `Order Confirmation - Papa's Fashion (Order #${orderDetails.id.substring(0, 8)})`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    const testEmail = email || process.env.EMAIL_USER;
    
    if (!testEmail) {
      return res.status(400).json({ success: false, error: 'No email provided' });
    }
    
    const testOrder = {
      id: 'test123456',
      customer_email: testEmail,
      amount_total: 13999, // €139.99 (€134.90 subtotal + €5 shipping)
      currency: 'eur',
      payment_status: 'paid',
      created: Math.floor(Date.now() / 1000),
      metadata: {
        customer_name: 'Test Customer',
        customer_email: testEmail,
        customer_phone: '+32 123 456 789',
        customer_country: 'Belgium',
        customer_address: 'Teststraat 1',
        customer_postal_code: '1000',
        customer_city: 'Brussels',
        subtotal: '134.90',
        shipping_cost: '5.00',
        order_items: JSON.stringify([
          { name: 'Ami Paris Sweater - Test', color: 'Black', size: 'M', qty: 1, price: 49.95 },
          { name: 'Asics Gel-NYC - Test', color: 'Ivory Clay Grey', size: '42', qty: 1, price: 84.95 }
        ])
      }
    };
    
    const cartItems = JSON.parse(testOrder.metadata.order_items);
    const result = await sendConfirmationEmail(testOrder.metadata, testOrder, cartItems);
    
    if (result.success) {
      res.json({ success: true, message: `Test email sent to ${testEmail}! Check your inbox.` });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
