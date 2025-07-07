const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;
    const { sendEmail } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    console.log('=== ORDER DETAILS REQUEST ===');
    console.log('Session ID:', sessionId);
    console.log('Send Email:', sendEmail);
    
    // Retrieve the checkout session from Stripe with line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });
    
    console.log('Session Payment Status:', session.payment_status);
    console.log('Session Line Items:', session.line_items?.data?.length || 0);
    
    const orderData = {
      id: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      created: session.created,
      metadata: session.metadata
    };
    
    // Send confirmation email if requested and payment was successful
    if (sendEmail === 'true' && session.payment_status === 'paid') {
      try {
        // Reconstruct cart items from line items
        let cartItems = [];
        if (session.line_items && session.line_items.data) {
          cartItems = session.line_items.data.map(lineItem => {
            const price = lineItem.price.unit_amount / 100; // Convert from cents
            const description = lineItem.price.product.description || '';
            
            // Extract size and color from description if available
            let size = '';
            let color = '';
            if (description) {
              const sizeMatch = description.match(/Size:\s*([^,]+)/);
              const colorMatch = description.match(/Color:\s*([^,]+)/);
              size = sizeMatch ? sizeMatch[1].trim() : '';
              color = colorMatch ? colorMatch[1].trim() : '';
            }
            
            return {
              name: lineItem.price.product.name,
              color: color,
              size: size,
              qty: lineItem.quantity,
              price: price
            };
          });
        }
        
        // Fallback: Use cart data from metadata if available
        if (cartItems.length === 0 || cartItems.some(item => !item.name)) {
          console.log('Using cart data from metadata as fallback');
          try {
            if (session.metadata?.cart_data) {
              const storedCart = JSON.parse(session.metadata.cart_data);
              cartItems = storedCart.map(item => ({
                name: item.name,
                color: item.color || 'N/A',
                size: item.size,
                qty: item.qty || item.quantity || 1,
                price: item.price || 49.95
              }));
            }
          } catch (parseError) {
            console.error('Error parsing cart data from metadata:', parseError);
          }
        }
        
        const emailResult = await sendConfirmationEmail(session.metadata, orderData, cartItems);
        orderData.emailSent = emailResult.success;
        if (!emailResult.success) {
          orderData.emailError = emailResult.error;
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        orderData.emailSent = false;
        orderData.emailError = emailError.message;
      }
    }
    
    res.json(orderData);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
}
