// filepath: src/scripts/main.js

// Helper function to get the correct backend URL
function getBackendUrl() {
    const hostname = window.location.hostname;
    
    // Production domain - using Vercel API routes
    if (hostname.includes('vercel.app') || hostname === 'papasfashion.com' || hostname === 'www.papasfashion.com') {
        return window.location.origin; // Same domain for Vercel
    }
    
    // Local development - still use the Express server for development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    } 
    
    // Fallback
    return window.location.origin;
}

// Test backend connection
async function testBackendConnection() {
    try {
        const backendUrl = getBackendUrl();
        console.log('Testing backend connection to:', backendUrl);
        const response = await fetch(`${backendUrl}/api/test`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Backend connection successful:', data);
            return true;
        } else {
            console.error('Backend responded with error:', response.status);
            // For production, don't show error for 404 - it's normal on Vercel
            if (window.location.hostname.includes('vercel.app') || window.location.hostname === 'papasfashion.com') {
                return true; // Assume it's working on Vercel
            }
            return false;
        }
    } catch (error) {
        console.error('Backend connection failed:', error);
        // For production, don't show error - assume it's working on Vercel
        if (window.location.hostname.includes('vercel.app') || window.location.hostname === 'papasfashion.com') {
            return true; // Assume it's working on Vercel
        }
        return false;
    }
}

// Show user-friendly message when backend is unavailable
function showBackendUnavailableMessage() {
    // Create a modal-style overlay
    const overlay = document.createElement('div');
    overlay.id = 'backend-unavailable-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Poppins', sans-serif;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    modal.innerHTML = `
        <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">
            🚫 Payment System Unavailable
        </h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
            Sorry, our payment system is currently unavailable. This usually happens when the server needs to be restarted.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <p style="color: #333; font-weight: 600; margin-bottom: 10px;">What can you do?</p>
            <ul style="color: #666; text-align: left; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Try again in a few minutes</li>
                <li>Contact us directly for manual order processing</li>
                <li>Check back later when the system is restored</li>
            </ul>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="closeBackendUnavailableMessage()" style="
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            ">
                Close
            </button>
            <button onclick="window.location.href='contact.html'" style="
                background: #28a745;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            ">
                Contact Us
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeBackendUnavailableMessage();
        }
    });
}

// Close the backend unavailable message
function closeBackendUnavailableMessage() {
    const overlay = document.getElementById('backend-unavailable-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Show subtle notification when backend is unavailable on page load
function showBackendStatusNotification() {
    const notification = document.createElement('div');
    notification.id = 'backend-status-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        max-width: 300px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">⚠️</span>
            <div>
                <div style="font-weight: 600; margin-bottom: 5px;">Payment System Offline</div>
                <div style="font-size: 12px; opacity: 0.9;">Checkout may not work. Click to dismiss.</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 8000);

    // Click to dismiss
    notification.addEventListener('click', function() {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Mobile device detection and error handling
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

// Enhanced error handling for mobile
function handleMobileError(error, context) {
    console.error(`Mobile error in ${context}:`, error);
    
    // Prevent white page by ensuring minimum content is visible
    if (document.body.children.length === 0) {
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                <h2>Loading...</h2>
                <p>If this persists, please refresh the page.</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px;">
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Wrap critical functions in try-catch for mobile
function safeExecute(fn, context) {
    try {
        return fn();
    } catch (error) {
        handleMobileError(error, context);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Only test backend connection on localhost - skip for production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        testBackendConnection().then(isConnected => {
            if (!isConnected) {
                showBackendStatusNotification();
            }
        });
    }
    
    safeExecute(() => {
        const menuBtn = document.getElementById('menu-btn');
        const sideNav = document.getElementById('side-nav');
        const pageTitle = document.getElementById('page-title');
        const navLinks = {
            home: document.getElementById('nav-home'),
            sneakers: document.getElementById('nav-sneakers'),
            sweaters: document.getElementById('nav-sweaters'),
            jerseys: document.getElementById('nav-jerseys'),
            beanies: document.getElementById('nav-beanies'),
            cart: document.getElementById('nav-cart')
        };
        const sections = {
            home: document.getElementById('home'),
            sneakers: document.getElementById('sneakers'),
            sweaters: document.getElementById('sweaters'),
            jerseys: document.getElementById('jerseys'),
            beanies: document.getElementById('beanies')
        };
        const titles = {
            home: 'HOME',
            sneakers: 'SNEAKERS',
            sweaters: 'SWEATERS',
            jerseys: 'FOOTBALL JERSEYS',
            beanies: 'BEANIES'
        };

        menuBtn.addEventListener('click', function() {
            sideNav.classList.toggle('open');
            highlightCurrentSection();
        });

        sideNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                sideNav.classList.remove('open');
            });
        });

        // Use event delegation to handle cart link clicks (including dynamically added ones)
        sideNav.addEventListener('click', function(e) {
            if (e.target.closest('#nav-cart')) {
                sideNav.classList.remove('open');
            }
        });

        // On DOMContentLoaded, forcibly hide all sections except the current one (even if CSS or other JS interferes)
        function showSection(sectionKey) {
            Object.keys(sections).forEach(key => {
                if (sections[key]) {
                    sections[key].style.setProperty('display', key === sectionKey ? 'block' : 'none', 'important');
                }
            });
        }

        function highlightCurrentSection() {
            let hash = window.location.hash || '#home';
            Object.values(navLinks).forEach(link => link.classList.remove('active'));
            let key = hash.replace('#', '');
            if (navLinks[key]) {
                navLinks[key].classList.add('active');
                showSection(key);
                if (pageTitle && titles[key]) {
                    pageTitle.textContent = titles[key];
                }
            } else {
                navLinks['home'].classList.add('active');
                showSection('home');
                if (pageTitle) {
                    pageTitle.textContent = titles['home'];
                }
            }
        }

        // Product image swap for all sweater products with outline and transition
        document.querySelectorAll('#sweaters .product').forEach(product => {
            const mainImg = product.querySelector('.main-product-img');
            const thumbImgs = product.querySelectorAll('.thumb-img');
            if (!mainImg || thumbImgs.length === 0) return;
            mainImg.style.transition = 'opacity 0.3s';
            function updateThumbOutline() {
                thumbImgs.forEach(img => {
                    if (img.src === mainImg.src) {
                        img.style.outline = '2px solid #000';
                        img.style.outlineOffset = '2px';
                    } else {
                        img.style.outline = 'none';
                    }
                });
            }
            thumbImgs.forEach(img => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function() {
                    if (mainImg.src === this.src) return; // Prevent fade if already selected
                    mainImg.style.opacity = '0';
                    setTimeout(() => {
                        mainImg.src = this.src;
                        mainImg.style.opacity = '1';
                        updateThumbOutline();
                    }, 300);
                });
            });
            updateThumbOutline();
        });

        // Ensure product image swap logic works for all products on the grid page
        function setupGridThumbnailLogic() {
            document.querySelectorAll('#sneakers .product').forEach(product => {
                const mainImg = product.querySelector('.main-product-img');
                const thumbImgs = product.querySelectorAll('.thumb-img');
                if (!mainImg || thumbImgs.length === 0) return;

                mainImg.style.transition = 'opacity 0.3s';

                function updateThumbOutline() {
                    thumbImgs.forEach(img => {
                        img.style.border = '2px solid transparent';
                    });
                    const selectedThumb = Array.from(thumbImgs).find(img => img.src === mainImg.src);
                    if (selectedThumb) {
                        selectedThumb.style.border = '2px solid #000';
                    }
                }

                thumbImgs.forEach(img => {
                    img.style.cursor = 'pointer';
                    // Remove any existing onclick handlers
                    img.removeAttribute('onclick');
                    img.addEventListener('click', function() {
                        if (mainImg.src === this.src) return; // Prevent fade if already selected
                        mainImg.style.opacity = '0';
                        setTimeout(() => {
                            mainImg.src = this.src;
                            mainImg.style.opacity = '1';
                            updateThumbOutline();
                        }, 300);
                    });
                });

                updateThumbOutline();
            });
        }

        // --- SHOPPING CART LOGIC ---
        const cartSection = document.getElementById('cart');
        const cartItemsDiv = document.getElementById('cart-items');
        const cartEmptyDiv = document.getElementById('cart-empty');
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');

        function showCartSection() {
            Object.keys(sections).forEach(key => {
                if (sections[key]) sections[key].style.setProperty('display', 'none', 'important');
            });
            if (cartSection) cartSection.style.setProperty('display', 'block', 'important');
            if (pageTitle) pageTitle.textContent = 'SHOPPING CART';
        }

        function updateCartDisplay() {
            if (!cartItemsDiv || !cartEmptyDiv) return;
            cartItemsDiv.innerHTML = '';
            const cartSummary = document.getElementById('cart-summary');
            const cartSubtotal = document.getElementById('cart-subtotal');
            
            if (cart.length === 0) {
                cartEmptyDiv.style.display = 'block';
                if (cartSummary) cartSummary.style.display = 'none';
                return;
            }
            
            cartEmptyDiv.style.display = 'none';
            let totalAmount = 0;
            
            // Check stock validation
            const stockValidation = stockManager ? stockManager.validateCartStock() : { valid: true, outOfStockItems: [] };
            
            cart.forEach((item, idx) => {
                // Handle both old cart structure (name, color, size, qty) and new structure (name, price, size, image, id, quantity)
                let imgSrc = '';
                let price = item.price; // Use stored price first
                let productName = item.name;
                let productSize = item.size;
                let productColor = item.color || 'Standard';
                let quantity = item.qty || item.quantity || 1;
                
                // Fallback price calculation for legacy cart items without price field
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
                    // Update the cart item with the calculated price for future use
                    item.price = price;
                    localStorage.setItem('cart', JSON.stringify(cart));
                }
                
                // Check if this item is out of stock
                const isOutOfStock = stockValidation.outOfStockItems.some(outOfStockItem => 
                    productName.includes(outOfStockItem.name) && 
                    productSize === outOfStockItem.size &&
                    productColor.includes(outOfStockItem.color)
                );
                
                // If item has image and price properties (new structure from detail pages)
                if (item.image && item.price) {
                    imgSrc = item.image;
                    price = item.price;
                } else {
                    // Set image based on product type
                    if (item.name.toLowerCase().includes('asics')) {
                        // Handle different Asics variants
                        if (item.name.toLowerCase().includes('yankees')) {
                            imgSrc = 'images/asicsgelnyc-yankees1.jpg';
                        } else if (item.name.toLowerCase().includes('ivory') || item.name.toLowerCase().includes('clay')) {
                            imgSrc = 'images/asicsgelnyc-ivoryclaygrey1.webp';
                        } else if (item.name.toLowerCase().includes('black') && item.name.toLowerCase().includes('graphite')) {
                            imgSrc = 'images/asicsgelnyc-blackgraphitegrey1.jpg';
                        } else {
                            imgSrc = 'images/asicsgelnyc-creamarcticsky1.webp'; // Default Cream Arctic Sky
                        }
                    } else if (item.name.toLowerCase().includes('barcelona')) {
                        imgSrc = 'images/fcbarcelona-limitededitionbarcelonacity1.jpg';
                    } else if (item.name.toLowerCase().includes('real madrid')) {
                        imgSrc = 'images/realmadrid-limitededitionreddragon1.jpg';
                    } else if (item.name.toLowerCase().includes('portugal')) {
                        imgSrc = 'images/portugal-limitededitionlv1.webp';
                    } else if (item.name.toLowerCase().includes('black')) {
                        imgSrc = 'images/ami-paris-black1.webp';
                    } else if (item.name.toLowerCase().includes('white')) {
                        imgSrc = 'images/ami-paris-white1.webp';
                    } else {
                        imgSrc = 'images/ami-paris-white1.webp'; // fallback
                    }
                }
                
                // Ensure price and quantity are valid numbers
                if (isNaN(price)) price = 49.95; // fallback price
                if (isNaN(quantity)) quantity = 1; // fallback quantity
                
                const itemTotal = (price * quantity).toFixed(2);
                totalAmount += price * quantity;
                
                const div = document.createElement('div');
                div.className = `cart-item ${isOutOfStock ? 'out-of-stock-item' : ''}`;
                div.innerHTML = `
                  <img src="${imgSrc}" alt="${productName}" class="cart-item-image">
                  <div class="cart-item-details">
                    <div class="cart-item-title">${productName} ${isOutOfStock ? '<span class="out-of-stock-indicator">OUT OF STOCK</span>' : ''}</div>
                    <div class="cart-item-meta">Size: ${productSize} &nbsp;|&nbsp; Color: ${productColor}</div>
                    <div class="cart-item-price" style="color:#d32f2f;font-weight:bold;">€${price} x ${quantity} = €${itemTotal}</div>
                  </div>
                  <div class="cart-item-actions">
                    <input type="number" min="1" class="cart-qty" value="${quantity}" data-idx="${idx}" aria-label="Quantity">
                    <button class="cart-remove" data-idx="${idx}" aria-label="Remove">&times;</button>
                  </div>
                `;
                cartItemsDiv.appendChild(div);
            });
            
            // Update subtotal display
            if (cartSummary && cartSubtotal) {
                cartSummary.style.display = 'block';
                // Ensure totalAmount is a valid number
                if (isNaN(totalAmount)) totalAmount = 0;
                cartSubtotal.textContent = `€${totalAmount.toFixed(2)}`;
            }
            
            // Update checkout button based on stock validation
            const checkoutBtn = document.querySelector('.checkout-btn, #checkout-btn, [onclick*="checkout"]');
            if (checkoutBtn) {
                if (!stockValidation.valid) {
                    checkoutBtn.disabled = true;
                    checkoutBtn.textContent = 'OUT OF STOCK ITEMS IN CART';
                    checkoutBtn.style.cssText = `
                        background-color: #dc3545 !important;
                        cursor: not-allowed !important;
                        opacity: 0.8;
                    `;
                } else {
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = 'COMPLETE PAYMENT';
                    checkoutBtn.style.cssText = `
                        background-color: #28a745 !important;
                        cursor: pointer !important;
                        opacity: 1;
                    `;
                }
            }
            
            // Quantity change logic
            cartItemsDiv.querySelectorAll('.cart-qty').forEach(input => {
                input.addEventListener('change', function() {
                    let idx = parseInt(this.getAttribute('data-idx'));
                    let val = parseInt(this.value);
                    if (isNaN(val) || val < 1) val = 1;
                    // Handle both cart structures
                    if (cart[idx].qty !== undefined) {
                        cart[idx].qty = val;
                    } else if (cart[idx].quantity !== undefined) {
                        cart[idx].quantity = val;
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartDisplay();
                });
            });
            // Remove item logic
            cartItemsDiv.querySelectorAll('.cart-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    let idx = parseInt(this.getAttribute('data-idx'));
                    cart.splice(idx, 1);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartDisplay();
                });
            });
        }

        // Add a nav link for the cart if not present
        if (!navLinks.cart) {
            const cartNav = document.createElement('li');
            cartNav.innerHTML = '<a id="nav-cart" href="index.html#cart"><svg style="vertical-align:middle;" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2.5 3h2l2.2 13.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.7l1.2-7.3H6.1"/></svg> <span style="margin-left:6px;">Cart</span></a>';
            document.getElementById('side-nav').querySelector('ul').appendChild(cartNav);
            navLinks.cart = document.getElementById('nav-cart');
            sections.cart = cartSection;
            titles.cart = 'SHOPPING CART';
        }

        // Listen for hash change to show cart
        window.addEventListener('hashchange', function() {
            if (window.location.hash === '#cart') showCartSection();
        });

        // --- PRODUCT PAGE CART BUTTON LOGIC ---
        function addCartButtonLogic() {
            document.querySelectorAll('.cart-btn').forEach(btn => {
                // Only add event listener if button doesn't already have one
                if (!btn.hasAttribute('data-cart-listener')) {
                    btn.setAttribute('data-cart-listener', 'true');
                    btn.addEventListener('click', function() {
                        // Find product info from the page - check both .product-title and h2
                        let name = document.querySelector('.product-title, h2')?.textContent?.trim() || 'Product';
                        
                        // Detect color from product name - more comprehensive detection
                        let color = 'Unknown';
                        if (name.toLowerCase().includes('yankees')) {
                            color = 'Yankees';
                        } else if (name.toLowerCase().includes('black') && name.toLowerCase().includes('graphite')) {
                            color = 'Black Graphite Grey';
                        } else if (name.toLowerCase().includes('cream') && name.toLowerCase().includes('arctic')) {
                            color = 'Cream Arctic Sky';
                        } else if (name.toLowerCase().includes('ivory') && name.toLowerCase().includes('clay')) {
                            color = 'Ivory Clay Grey';
                        } else if (name.toLowerCase().includes('black')) {
                            color = 'Black';
                        } else if (name.toLowerCase().includes('white')) {
                            color = 'White';
                        } else {
                            // Try to get color from page-specific variables if they exist
                            if (typeof window.currentProductColor !== 'undefined') {
                                color = window.currentProductColor;
                            } else {
                                // Last fallback - extract from name
                                const nameParts = name.split(' ');
                                if (nameParts.length > 2) {
                                    color = nameParts.slice(2).join(' '); // Everything after "Asics Gel-NYC"
                                }
                            }
                        }
                        let size = document.querySelector('.size-btn.selected')?.textContent || 'M';
                        // If no size selected, pick first
                        if (!document.querySelector('.size-btn.selected')) {
                            let firstBtn = document.querySelector('.size-btn');
                            if (firstBtn) size = firstBtn.textContent;
                        }
                        // Determine price based on product name
                        let price = 49.95; // Default price for Ami Paris sweaters
                        if (name.toLowerCase().includes('asics')) {
                            price = 84.95; // Asics shoes price
                        } else if (name.toLowerCase().includes('barcelona')) {
                            price = 29.95; // FC Barcelona jersey price
                        } else if (name.toLowerCase().includes('real madrid')) {
                            price = 29.95; // Real Madrid jersey price
                        } else if (name.toLowerCase().includes('portugal')) {
                            price = 29.95; // Portugal jersey price
                        }
                        
                        // Add to cart with price included
                        let found = false;
                        for (let item of cart) {
                            if (item.name === name && item.color === color && item.size === size) {
                                item.qty++;
                                // Ensure existing items also have the price field
                                if (!item.price) {
                                    item.price = price;
                                }
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            cart.push({ name, color, size, qty: 1, price: price });
                        }
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartDisplay();
                        window.location.hash = '#cart';
                    });
                }
            });
        }

        // --- SIZE BUTTON LOGIC ---
        function addSizeButtonLogic() {
            document.querySelectorAll('.size-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
            });
        }

        // --- GOOGLE PLACES AUTOCOMPLETE FOR ADDRESS FIELD ---
        window.initGooglePlacesAutocomplete = function() {
            var addressInput = document.getElementById('buyer-address');
            if (addressInput && window.google && window.google.maps && window.google.maps.places) {
                var autocomplete = new google.maps.places.Autocomplete(addressInput, {
                    types: ['address'],
                    componentRestrictions: { country: ["be", "nl", "fr", "de", "lu"] }
                });
                // Optionally, fill in other fields on place selection
                autocomplete.addListener('place_changed', function() {
                    var place = autocomplete.getPlace();
                    // You can parse place.address_components here to auto-fill postal code, city, etc.
                });
            }
        };

        // --- INIT ON LOAD ---
        updateCartDisplay();
        addCartButtonLogic();
        addSizeButtonLogic();
        setupGridThumbnailLogic(); // Initialize thumbnail logic for grid page
        // Function to migrate existing cart items to include price field
        function migrateCartItems() {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            let updated = false;
            
            cart.forEach(item => {
                if (!item.price) {
                    // Add price field to existing cart items
                    let price = 49.95; // Default price for Ami Paris sweaters
                    if (item.name.toLowerCase().includes('asics')) {
                        price = 84.95; // Asics shoes price
                    } else if (item.name.toLowerCase().includes('barcelona')) {
                        price = 29.95; // FC Barcelona jersey price
                    } else if (item.name.toLowerCase().includes('real madrid')) {
                        price = 29.95; // Real Madrid jersey price
                    } else if (item.name.toLowerCase().includes('portugal')) {
                        price = 29.95; // Portugal jersey price
                    }
                    item.price = price;
                    updated = true;
                }
            });
            
            if (updated) {
                localStorage.setItem('cart', JSON.stringify(cart));
                console.log('Cart items migrated to include price field');
            }
        }
        migrateCartItems(); // Migrate existing cart items
        // Hide all sections except the current one on initial load
        highlightCurrentSection();
        window.addEventListener('hashchange', highlightCurrentSection);

        // --- STRIPE CHECKOUT LOGIC ---
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                
                // Validate stock before proceeding
                if (stockManager && stockManager.stockConfig) {
                    const stockValidation = stockManager.validateCartStock();
                    if (!stockValidation.valid) {
                        alert('❌ Cannot checkout: Your cart contains out-of-stock items. Please remove them and try again.');
                        return;
                    }
                }
                
                let subtotal = cart.reduce((sum, item) => {
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
                        // Update the cart item with the price for future use
                        item.price = price;
                    }
                    
                    let quantity = item.qty || item.quantity || 1;
                    
                    // Ensure price and quantity are valid numbers
                    if (isNaN(price)) price = 49.95; // fallback price
                    if (isNaN(quantity)) quantity = 1; // fallback quantity
                    
                    return sum + price * quantity;
                }, 0);
                
                // Ensure subtotal is a valid number
                if (isNaN(subtotal)) subtotal = 0;
                
                // Save updated cart with prices back to localStorage
                localStorage.setItem('cart', JSON.stringify(cart));

                // Calculate shipping cost (copy your logic from updateShippingInfoAndSummary)
                const country = document.getElementById('buyer-country')?.value;
                let shipping = 0;
                if (country === 'Belgium') {
                    shipping = subtotal >= 40 ? 0 : 5;
                } else if (["Netherlands", "France", "Germany", "Luxembourg"].includes(country)) {
                    shipping = subtotal >= 90 ? 0 : 8;
                }

                let total = subtotal + shipping;

                // Collect all customer information
                const customerInfo = {
                    name: document.getElementById('buyer-name')?.value || '',
                    email: document.getElementById('buyer-email')?.value || '',
                    phone: document.getElementById('buyer-phone')?.value || '',
                    country: document.getElementById('buyer-country')?.value || '',
                    address: document.getElementById('buyer-address')?.value || '',
                    houseNumber: document.getElementById('buyer-housenumber')?.value || '',
                    postBox: document.getElementById('buyer-postbox')?.value || '',
                    postalCode: document.getElementById('buyer-postal')?.value || '',
                    city: document.getElementById('buyer-city')?.value || '',
                    paymentMethod: document.getElementById('payment-method')?.value || 'card'
                };

                console.log('Sending payment request with consistent pricing:');
                console.log('- Subtotal:', subtotal);
                console.log('- Shipping:', shipping);
                console.log('- Total:', total);
                console.log('- Cart items:', cart.map(item => `${item.name} - €${item.price} x ${item.qty || item.quantity || 1}`));
                
                try {
                    const backendUrl = getBackendUrl();
                    const response = await fetch(`${backendUrl}/api/create-checkout-session`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            amount: total, 
                            customerInfo,
                            cart
                        })
                    });
                    
                    console.log('Response status:', response.status);
                    console.log('Response headers:', response.headers);
                    
                    const data = await response.json();
                    console.log('Response data:', data);
                    
                    if (data.url) {
                        window.location = data.url;
                    } else {
                        alert('Payment failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Network error:', error);
                    
                    // Check if it's a connection refused error (backend not running)
                    if (error.message.includes('Failed to fetch') || 
                        error.message.includes('ERR_CONNECTION_REFUSED') ||
                        error.message.includes('fetch')) {
                        
                        showBackendUnavailableMessage();
                    } else {
                        alert('Network error: ' + error.message);
                    }
                }
            });
        }
    }, 'DOMContentLoaded');
});

// Function to show a user-friendly message when backend is unavailable
function showBackendUnavailableMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 90%;
        width: 400px;
        text-align: center;
        font-family: 'Inter', sans-serif;
    `;
    
    messageDiv.innerHTML = `
        <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h3 style="color: #1e293b; margin: 0 0 1rem 0; font-size: 1.3rem;">Server Not Running</h3>
        <p style="color: #64748b; margin: 0 0 1.5rem 0; line-height: 1.5;">
            The payment server is currently offline. Please start the backend server to process payments.
        </p>
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
            <strong style="color: #1e293b;">To fix this:</strong><br>
            <span style="color: #64748b; font-size: 0.9rem;">
                1. Open VS Code<br>
                2. Press Ctrl+Shift+P<br>
                3. Type "Tasks: Run Task"<br>
                4. Select "Start Backend Server"
            </span>
        </div>
        <button onclick="this.parentElement.remove(); location.reload();" 
                style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                       color: white; border: none; padding: 0.75rem 1.5rem; 
                       border-radius: 8px; cursor: pointer; font-weight: 600;">
            OK, Got It
        </button>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(messageDiv);
    
    // Remove on backdrop click
    backdrop.onclick = () => {
        backdrop.remove();
        messageDiv.remove();
    };
}

// Global navigation function for homepage buttons
window.showSection = function(sectionKey) {
    // Update the hash to trigger the existing navigation system
    window.location.hash = '#' + sectionKey;
    
    // Also directly show the section if we're on the main page
    const sections = {
        home: document.getElementById('home'),
        sneakers: document.getElementById('sneakers'),
        sweaters: document.getElementById('sweaters'),
        jerseys: document.getElementById('jerseys'),
        beanies: document.getElementById('beanies'),
        cart: document.getElementById('cart')
    };
    
    if (sections[sectionKey]) {
        Object.keys(sections).forEach(key => {
            if (sections[key]) {
                sections[key].style.setProperty('display', key === sectionKey ? 'block' : 'none', 'important');
            }
        });
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        const titles = {
            home: 'HOME',
            sneakers: 'SNEAKERS',
            sweaters: 'SWEATERS',
            jerseys: 'FOOTBALL JERSEYS',
            beanies: 'BEANIES',
            cart: 'SHOPPING CART'
        };
        if (pageTitle && titles[sectionKey]) {
            pageTitle.textContent = titles[sectionKey];
        }
    }
}

// Newsletter signup functionality
function handleNewsletterSignup() {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate newsletter signup (in a real app, this would send to your backend)
    const btn = document.querySelector('.newsletter-btn');
    const originalText = btn.textContent;
    
    btn.textContent = 'SUBSCRIBING...';
    btn.disabled = true;
    
    setTimeout(() => {
        // Store email in localStorage as a simple example
        let subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
        }
        
        btn.textContent = 'SUBSCRIBED ✓';
        btn.style.background = '#10b981';
        emailInput.value = '';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.background = '#3b82f6';
        }, 2000);
        
        alert('Thank you for subscribing! You\'ll be the first to know about new drops and exclusive deals.');
    }, 1000);
}

// Add Enter key support for newsletter signup
document.addEventListener('DOMContentLoaded', function() {
    const newsletterInput = document.getElementById('newsletter-email');
    if (newsletterInput) {
        newsletterInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleNewsletterSignup();
            }
        });
    }
});

// Stock Management Integration
class SimpleStockManager {
    constructor() {
        this.stockConfig = null;
        this.loadStockConfig();
    }

    async loadStockConfig() {
        try {
            const response = await fetch('./stock-config.json');
            this.stockConfig = await response.json();
            console.log('Stock configuration loaded successfully');
        } catch (error) {
            console.error('Error loading stock configuration:', error);
        }
    }

    getStockLevel(productType, productVariant, size) {
        if (!this.stockConfig) return 0;
        
        try {
            const product = this.stockConfig.products[productType][productVariant];
            const sizeStock = product.sizes[size];
            return sizeStock ? sizeStock.stock : 0;
        } catch (error) {
            console.error('Error getting stock level:', error);
            return 0;
        }
    }

    isInStock(productType, productVariant, size) {
        return this.getStockLevel(productType, productVariant, size) > 0;
    }

    updateSizeButtonStatus(productType, productVariant) {
        if (!this.stockConfig) return;
        
        const sizeButtons = document.querySelectorAll('.size-btn');
        sizeButtons.forEach(btn => {
            const size = btn.textContent.trim();
            const stock = this.getStockLevel(productType, productVariant, size);
            
            // Reset classes
            btn.classList.remove('out-of-stock', 'low-stock');
            
            if (stock === 0) {
                btn.classList.add('out-of-stock');
                btn.disabled = true;
                btn.title = 'Out of Stock';
            } else {
                btn.disabled = false;
                btn.title = `${stock} in stock`;
            }
        });
    }

    // Cart validation functions
    validateCartStock() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const outOfStockItems = [];
        
        if (!this.stockConfig) return { valid: true, outOfStockItems: [] };
        
        cart.forEach((item, index) => {
            try {
                // Map product names to stock config structure
                let productType, productVariant;
                
                if (item.name.includes('Asics Gel-NYC')) {
                    productType = 'asics-gel-nyc';
                    if (item.color.includes('Black Graphite')) productVariant = 'black-graphite-grey';
                    else if (item.color.includes('Cream Arctic')) productVariant = 'cream-arctic-sky';
                    else if (item.color.includes('Ivory Clay')) productVariant = 'ivory-clay-grey';
                    else if (item.color.includes('Yankees')) productVariant = 'yankees';
                } else if (item.name.includes('Ami Paris')) {
                    productType = 'ami-paris';
                    productVariant = item.color.toLowerCase().includes('black') ? 'black' : 'white';
                } else if (item.name.includes('FC Barcelona')) {
                    productType = 'football-jerseys';
                    productVariant = 'fc-barcelona';
                } else if (item.name.includes('Real Madrid')) {
                    productType = 'football-jerseys';
                    productVariant = 'real-madrid';
                } else if (item.name.includes('Portugal')) {
                    productType = 'football-jerseys';
                    productVariant = 'portugal';
                }
                
                if (productType && productVariant) {
                    const stockLevel = this.getStockLevel(productType, productVariant, item.size);
                    if (stockLevel === 0) {
                        outOfStockItems.push({ ...item, index });
                    }
                }
            } catch (error) {
                console.error('Error validating cart item:', error);
            }
        });
        
        return {
            valid: outOfStockItems.length === 0,
            outOfStockItems
        };
    }

    updateCartDisplay() {
        const cartValidation = this.validateCartStock();
        
        // Update cart items display
        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(cartItem => {
            const itemName = cartItem.querySelector('.item-name')?.textContent || '';
            const itemSize = cartItem.querySelector('.item-size')?.textContent || '';
            const itemColor = cartItem.querySelector('.item-color')?.textContent || '';
            
            // Check if this item is out of stock
            const isOutOfStock = cartValidation.outOfStockItems.some(outOfStockItem => 
                itemName.includes(outOfStockItem.name) && 
                itemSize.includes(outOfStockItem.size) &&
                itemColor.includes(outOfStockItem.color)
            );
            
            if (isOutOfStock) {
                cartItem.classList.add('out-of-stock-item');
                // Add out of stock indicator
                if (!cartItem.querySelector('.out-of-stock-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'out-of-stock-indicator';
                    indicator.textContent = 'OUT OF STOCK';
                    indicator.style.cssText = `
                        background: #dc3545;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 3px;
                        font-size: 0.8rem;
                        font-weight: bold;
                        margin-left: 10px;
                    `;
                    cartItem.appendChild(indicator);
                }
            } else {
                cartItem.classList.remove('out-of-stock-item');
                const indicator = cartItem.querySelector('.out-of-stock-indicator');
                if (indicator) indicator.remove();
            }
        });
        
        // Update checkout button
        const checkoutBtn = document.querySelector('.checkout-btn, #checkout-btn, [onclick*="checkout"]');
        if (checkoutBtn) {
            if (!cartValidation.valid) {
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'OUT OF STOCK ITEMS IN CART';
                checkoutBtn.style.cssText = `
                    background-color: #dc3545 !important;
                    cursor: not-allowed !important;
                    opacity: 0.8;
                `;
            } else {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'COMPLETE PAYMENT';
                checkoutBtn.style.cssText = `
                    background-color: #28a745 !important;
                    cursor: pointer !important;
                    opacity: 1;
                `;
            }
        }
    }

    // Stock reduction functions
    async reduceStock(productType, productVariant, size, quantity = 1) {
        if (!this.stockConfig) {
            console.error('Stock config not loaded');
            return false;
        }
        
        try {
            const product = this.stockConfig.products[productType][productVariant];
            const sizeStock = product.sizes[size];
            
            if (!sizeStock) {
                console.error(`Size ${size} not found for ${productType} ${productVariant}`);
                return false;
            }
            
            if (sizeStock.stock < quantity) {
                console.error(`Insufficient stock. Available: ${sizeStock.stock}, Requested: ${quantity}`);
                return false;
            }
            
            // Reduce stock
            sizeStock.stock -= quantity;
            
            // Update last modified timestamp
            this.stockConfig.settings.lastUpdated = new Date().toISOString();
            
            // Save updated stock config back to server
            await this.saveStockConfig();
            
            console.log(`Stock reduced: ${productType} ${productVariant} size ${size} by ${quantity}. New stock: ${sizeStock.stock}`);
            return true;
            
        } catch (error) {
            console.error('Error reducing stock:', error);
            return false;
        }
    }

    async saveStockConfig() {
        try {
            // For development, we'll send the updated config to the backend to save
            const backendUrl = getBackendUrl();
            const response = await fetch(`${backendUrl}/update-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.stockConfig)
            });
            
            if (response.ok) {
                console.log('Stock configuration updated successfully');
            } else {
                console.error('Failed to update stock configuration');
            }
        } catch (error) {
            console.error('Error saving stock configuration:', error);
        }
    }

    async processOrderStockReduction(cartItems) {
        const reductions = [];
        
        for (const item of cartItems) {
            try {
                // Map product names to stock config structure
                let productType, productVariant;
                
                if (item.name.includes('Asics Gel-NYC')) {
                    productType = 'asics-gel-nyc';
                    if (item.color.includes('Black Graphite')) productVariant = 'black-graphite-grey';
                    else if (item.color.includes('Cream Arctic')) productVariant = 'cream-arctic-sky';
                    else if (item.color.includes('Ivory Clay')) productVariant = 'ivory-clay-grey';
                    else if (item.color.includes('Yankees')) productVariant = 'yankees';
                } else if (item.name.includes('Ami Paris')) {
                    productType = 'ami-paris';
                    productVariant = item.color.toLowerCase().includes('black') ? 'black' : 'white';
                } else if (item.name.includes('FC Barcelona')) {
                    productType = 'football-jerseys';
                    productVariant = 'fc-barcelona';
                } else if (item.name.includes('Real Madrid')) {
                    productType = 'football-jerseys';
                    productVariant = 'real-madrid';
                } else if (item.name.includes('Portugal')) {
                    productType = 'football-jerseys';
                    productVariant = 'portugal';
                }
                
                if (productType && productVariant) {
                    const quantity = item.qty || item.quantity || 1;
                    const success = await this.reduceStock(productType, productVariant, item.size, quantity);
                    
                    reductions.push({
                        item: item,
                        success: success,
                        productType: productType,
                        productVariant: productVariant
                    });
                }
            } catch (error) {
                console.error('Error processing stock reduction for item:', item, error);
                reductions.push({
                    item: item,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return reductions;
    }
}

// Initialize stock manager
let stockManager = new SimpleStockManager();
