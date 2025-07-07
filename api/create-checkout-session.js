const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, customerInfo, cart } = req.body;
    
    // Determine the frontend URL based on environment
    let frontendUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '');
    
    console.log('=== URL DETECTION DEBUG ===');
    console.log('Request Headers Origin:', req.headers.origin);
    console.log('Request Headers Referer:', req.headers.referer);
    console.log('Initial Frontend URL:', frontendUrl);
    console.log('Headers Host:', req.headers.host);
    console.log('Headers User-Agent:', req.headers['user-agent']);
    
    // Enhanced detection for local development
    const isLocalDevelopment = frontendUrl && (
      frontendUrl.includes('127.0.0.1:5500') || 
      frontendUrl.includes('localhost:5500') ||
      frontendUrl.includes('127.0.0.1') ||
      frontendUrl.includes('localhost')
    );
    
    console.log('Is Local Development:', isLocalDevelopment);
    
    // Force local development URL if we detect local environment
    if (isLocalDevelopment) {
      frontendUrl = 'http://127.0.0.1:5500/Website/my-website';
      console.log('FORCED to local dev URL:', frontendUrl);
    } else if (frontendUrl && !frontendUrl.includes('/Website/my-website')) {
      // For local development, the frontend is served from a subdirectory
      if (frontendUrl.includes('127.0.0.1:5500') || frontendUrl.includes('localhost:5500')) {
        frontendUrl = frontendUrl + '/Website/my-website';
      }
    }
    
    // Fallback for local development
    if (!frontendUrl) {
      frontendUrl = 'http://127.0.0.1:5500/Website/my-website';
      console.log('FALLBACK to local dev URL:', frontendUrl);
    }
    
    console.log('Final Frontend URL:', frontendUrl);
    console.log('=== END URL DEBUG ===');
    
    console.log('=== CHECKOUT SESSION REQUEST ===');
    console.log('Amount:', amount);
    console.log('Customer Info:', customerInfo);
    console.log('Cart:', JSON.stringify(cart, null, 2));
    console.log('Request Origin:', req.headers.origin);
    console.log('Request Referer:', req.headers.referer);
    console.log('Calculated Frontend URL:', frontendUrl);
    
    if (!amount || amount <= 0) {
      console.log('ERROR: Invalid amount');
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      console.log('ERROR: Missing customer information');
      return res.status(400).json({ error: 'Customer information is required' });
    }

    // Build full address string
    const fullAddress = [
      customerInfo.address,
      customerInfo.houseNumber,
      customerInfo.postBox ? `Post Box: ${customerInfo.postBox}` : null
    ].filter(Boolean).join(' ');

    // Calculate subtotal from cart items
    let subtotal = 0;
    const lineItems = [];
    
    if (cart && cart.length > 0) {
      cart.forEach(item => {
        let price = item.price; // Use stored price from cart item
        
        // Fallback for legacy cart items without price field
        if (!price) {
          price = 49.95; // Default price for Ami Paris sweaters
          if (item.name.toLowerCase().includes('asics')) {
            price = 84.95; // Asics shoes price
          } else if (item.name.toLowerCase().includes('barcelona')) {
            price = 29.95; // FC Barcelona jersey price
          } else if (item.name.toLowerCase().includes('real madrid')) {
            price = 29.95; // Real Madrid jersey price
          } else if (item.name.toLowerCase().includes('portugal')) {
            price = 29.95; // Portugal jersey price
          }
        }
        
        const quantity = item.qty || item.quantity || 1;
        subtotal += price * quantity;
        
        console.log(`Item: ${item.name}, Price: €${price} (${item.price ? 'stored' : 'calculated'}), Quantity: ${quantity}`);
        
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.name,
              description: `Size: ${item.size}, Color: ${item.color || 'N/A'}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: quantity,
        });
      });
    }

    // Calculate shipping cost (same logic as frontend)
    let shipping = 0;
    const country = customerInfo.country;
    if (country === 'Belgium') {
      shipping = subtotal >= 40 ? 0 : 5;
    } else if (["Netherlands", "France", "Germany", "Luxembourg"].includes(country)) {
      shipping = subtotal >= 90 ? 0 : 8;
    }

    console.log(`Subtotal: €${subtotal}, Shipping: €${shipping}, Country: ${country}`);

    // Add shipping as a separate line item if there's a shipping cost
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Shipping',
            description: `Shipping to ${country}`,
          },
          unit_amount: Math.round(shipping * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // If no cart items, create a single line item
    if (lineItems.length === 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Papa's Fashion - Order for ${customerInfo.name}`,
            description: 'Fashion items from Papa\'s Fashion 9K',
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    console.log('Final Line Items:', JSON.stringify(lineItems, null, 2));

    // Verify the total matches
    const calculatedTotal = subtotal + shipping;
    console.log(`Frontend total: €${amount}, Backend calculated: €${calculatedTotal}`);
    
    // Calculate what Stripe will actually charge based on line items
    const stripeTotal = lineItems.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount * item.quantity);
    }, 0) / 100; // Convert from cents
    
    console.log(`Stripe will charge: €${stripeTotal} (from line items)`);
    
    if (Math.abs(amount - calculatedTotal) > 0.01) {
      console.warn('Total mismatch! Frontend:', amount, 'Backend:', calculatedTotal);
    }
    
    if (Math.abs(calculatedTotal - stripeTotal) > 0.01) {
      console.warn('Line item mismatch! Calculated:', calculatedTotal, 'Stripe:', stripeTotal);
    }

    // Create concise order summary for metadata (Stripe has 500 char limit per field)
    let orderSummary = 'No items';
    let itemCount = 0;
    
    if (cart && cart.length > 0) {
      itemCount = cart.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
      
      // Create a concise summary instead of full JSON
      const summaryItems = cart.slice(0, 3).map(item => 
        `${item.name.split(' ').slice(0, 2).join(' ')} (${item.qty || item.quantity || 1}x)`
      );
      
      if (cart.length > 3) {
        summaryItems.push(`+${cart.length - 3} more`);
      }
      
      orderSummary = summaryItems.join(', ');
      
      // Add shipping info to summary
      if (shipping > 0) {
        orderSummary += ` + €${shipping} shipping`;
      }
      
      // Ensure summary doesn't exceed 450 chars (leaving room for safety)
      if (orderSummary.length > 450) {
        orderSummary = `${itemCount} items: ${cart[0].name.split(' ').slice(0, 2).join(' ')} + others`;
        if (shipping > 0) {
          orderSummary += ` + €${shipping} shipping`;
        }
      }
    }

    console.log('Creating Stripe session...');
    
    const successUrl = `${frontendUrl}/src/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/src/cancel.html`;
    
    console.log('=== STRIPE URLS DEBUG ===');
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);
    console.log('=== END STRIPE URLS DEBUG ===');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [
        'card',
        'bancontact'  // Popular in Belgium
      ],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerInfo.email,
      custom_text: {
        submit: {
          message: 'Complete your purchase with Papa\'s Fashion - Premium streetwear delivered to your door.'
        }
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'Papa\'s Fashion Order',
          footer: 'Thank you for shopping with Papa\'s Fashion!'
        }
      },
      metadata: {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_country: customerInfo.country,
        customer_address: fullAddress,
        customer_postal_code: customerInfo.postalCode,
        customer_city: customerInfo.city,
        payment_method_selected: customerInfo.paymentMethod,
        order_amount: amount.toString(),
        subtotal: subtotal.toString(),
        shipping_cost: shipping.toString(),
        item_count: itemCount.toString(),
        order_summary: orderSummary,
        cart_data: JSON.stringify(cart || []).substring(0, 500)
      }
    });
    
    console.log('✅ Stripe session created successfully:', session.id);
    console.log('Session total:', session.amount_total / 100, 'EUR');

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
  }
}
