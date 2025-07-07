// Stock Management System for Papa's Fashion
// This file handles inventory tracking and stock updates

class StockManager {
    constructor() {
        this.stockConfig = null;
        this.loadStockConfig();
    }

    // Load stock configuration from JSON file
    async loadStockConfig() {
        try {
            const response = await fetch('./stock-config.json');
            this.stockConfig = await response.json();
            console.log('Stock configuration loaded successfully');
            
            // Check for alerts immediately after loading
            this.checkLowStockAlerts();
            
        } catch (error) {
            console.error('Error loading stock configuration:', error);
        }
    }

    // Check if a product/size combination is in stock
    isInStock(productType, productVariant, size) {
        if (!this.stockConfig) return false;
        
        try {
            const product = this.stockConfig.products[productType][productVariant];
            const sizeStock = product.sizes[size];
            return sizeStock && sizeStock.stock > 0;
        } catch (error) {
            console.error('Error checking stock:', error);
            return false;
        }
    }

    // Get stock level for a specific product/size
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

    // Reduce stock when item is purchased
    reduceStock(productType, productVariant, size, quantity = 1) {
        if (!this.stockConfig) return false;
        
        try {
            const product = this.stockConfig.products[productType][productVariant];
            const sizeStock = product.sizes[size];
            
            if (sizeStock && sizeStock.stock >= quantity) {
                sizeStock.stock -= quantity;
                this.updateLastModified();
                this.checkLowStockAlerts();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error reducing stock:', error);
            return false;
        }
    }

    // Check for low stock alerts
    checkLowStockAlerts() {
        if (!this.stockConfig) return;
        
        const lowStockItems = [];
        const outOfStockItems = [];
        const threshold = this.stockConfig.settings.lowStockThreshold;
        
        Object.keys(this.stockConfig.products).forEach(productType => {
            Object.keys(this.stockConfig.products[productType]).forEach(variant => {
                const product = this.stockConfig.products[productType][variant];
                Object.keys(product.sizes).forEach(size => {
                    const sizeStock = product.sizes[size];
                    if (sizeStock.stock === 0) {
                        outOfStockItems.push({
                            product: product.name,
                            size: size,
                            sku: sizeStock.sku
                        });
                    } else if (sizeStock.stock <= threshold) {
                        lowStockItems.push({
                            product: product.name,
                            size: size,
                            stock: sizeStock.stock,
                            sku: sizeStock.sku
                        });
                    }
                });
            });
        });
        
        this.stockConfig.alerts.lowStock = lowStockItems;
        this.stockConfig.alerts.outOfStock = outOfStockItems;
        
        // Log alerts
        if (lowStockItems.length > 0) {
            console.warn('Low stock alerts:', lowStockItems);
        }
        if (outOfStockItems.length > 0) {
            console.warn('Out of stock alerts:', outOfStockItems);
        }
    }

    // Get all available sizes for a product
    getAvailableSizes(productType, productVariant) {
        if (!this.stockConfig) return [];
        
        try {
            const product = this.stockConfig.products[productType][productVariant];
            return Object.keys(product.sizes).filter(size => {
                return product.sizes[size].stock > 0;
            });
        } catch (error) {
            console.error('Error getting available sizes:', error);
            return [];
        }
    }

    // Get product price
    getProductPrice(productType, productVariant) {
        if (!this.stockConfig) return 0;
        
        try {
            return this.stockConfig.products[productType][productVariant].price;
        } catch (error) {
            console.error('Error getting product price:', error);
            return 0;
        }
    }

    // Get product SKU
    getProductSku(productType, productVariant, size) {
        if (!this.stockConfig) return '';
        
        try {
            const product = this.stockConfig.products[productType][productVariant];
            const sizeStock = product.sizes[size];
            return sizeStock ? sizeStock.sku : '';
        } catch (error) {
            console.error('Error getting product SKU:', error);
            return '';
        }
    }

    // Update last modified timestamp
    updateLastModified() {
        if (this.stockConfig) {
            this.stockConfig.settings.lastUpdated = new Date().toISOString();
        }
    }

    // Save stock configuration (for admin use)
    async saveStockConfig() {
        try {
            // In a real application, this would save to a database
            // For now, we'll just log the updated configuration
            console.log('Stock configuration updated:', this.stockConfig);
            
            // You could implement a backend endpoint to save this
            // await fetch('/api/update-stock-config', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(this.stockConfig)
            // });
            
            return true;
        } catch (error) {
            console.error('Error saving stock configuration:', error);
            return false;
        }
    }

    // Get stock statistics
    getStockStatistics() {
        if (!this.stockConfig) return null;
        
        let totalProducts = 0;
        let totalStock = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        
        Object.keys(this.stockConfig.products).forEach(productType => {
            Object.keys(this.stockConfig.products[productType]).forEach(variant => {
                const product = this.stockConfig.products[productType][variant];
                Object.keys(product.sizes).forEach(size => {
                    totalProducts++;
                    const stock = product.sizes[size].stock;
                    totalStock += stock;
                    
                    if (stock === 0) {
                        outOfStockCount++;
                    } else if (stock <= this.stockConfig.settings.lowStockThreshold) {
                        lowStockCount++;
                    }
                });
            });
        });
        
        return {
            totalProducts,
            totalStock,
            lowStockCount,
            outOfStockCount,
            averageStock: totalProducts > 0 ? (totalStock / totalProducts).toFixed(2) : 0
        };
    }

    // Mock function to simulate stock reduction after purchase
    simulatePurchase(cartItems) {
        console.log('Simulating stock reduction for purchase:', cartItems);
        
        cartItems.forEach(item => {
            // Parse product info from cart item
            const productInfo = this.parseProductInfo(item.name);
            if (productInfo) {
                const reduced = this.reduceStock(
                    productInfo.type,
                    productInfo.variant,
                    item.size,
                    item.qty || item.quantity || 1
                );
                
                if (reduced) {
                    console.log(`✅ Stock reduced for ${item.name} (${item.size}) - Qty: ${item.qty || item.quantity || 1}`);
                } else {
                    console.warn(`❌ Failed to reduce stock for ${item.name} (${item.size})`);
                }
            }
        });
        
        // Save updated configuration
        this.saveStockConfig();
    }

    // Parse product name to extract type and variant
    parseProductInfo(productName) {
        const name = productName.toLowerCase();
        
        if (name.includes('asics') && name.includes('gel-nyc')) {
            let variant = '';
            if (name.includes('black') && name.includes('graphite')) {
                variant = 'black-graphite-grey';
            } else if (name.includes('cream') && name.includes('arctic')) {
                variant = 'cream-arctic-sky';
            } else if (name.includes('ivory') && name.includes('clay')) {
                variant = 'ivory-clay-grey';
            } else if (name.includes('yankees')) {
                variant = 'yankees';
            }
            return { type: 'asics-gel-nyc', variant };
        }
        
        if (name.includes('ami') && name.includes('paris')) {
            const variant = name.includes('black') ? 'black' : 'white';
            return { type: 'ami-paris', variant };
        }
        
        if (name.includes('barcelona')) {
            return { type: 'football-jerseys', variant: 'fc-barcelona' };
        }
        
        if (name.includes('real') && name.includes('madrid')) {
            return { type: 'football-jerseys', variant: 'real-madrid' };
        }
        
        if (name.includes('portugal')) {
            return { type: 'football-jerseys', variant: 'portugal' };
        }
        
        return null;
    }
}

// Initialize global stock manager
const stockManager = new StockManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockManager;
}
