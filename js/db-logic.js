// ============================================
// 💾 DATABASE LOGIC (Firestore)
// ============================================

class DatabaseManager {
    constructor() {
        this.productsRef = db.collection('products');
        this.setupAdminPanel();
    }

    // Setup admin panel event listeners
    setupAdminPanel() {
        // Close admin modal
        document.getElementById('close-admin').addEventListener('click', () => {
            document.getElementById('admin-modal').classList.add('hidden');
        });

        // Add product form
        document.getElementById('add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProduct();
        });
    }

    // Load all products (real-time listener)
    loadProducts() {
        const loadingDiv = document.getElementById('loading-products');
        const containerDiv = document.getElementById('products-container');
        const noProductsDiv = document.getElementById('no-products');

        this.productsRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            loadingDiv.classList.add('hidden');
            
            if (snapshot.empty) {
                containerDiv.classList.add('hidden');
                noProductsDiv.classList.remove('hidden');
                return;
            }

            noProductsDiv.classList.add('hidden');
            containerDiv.classList.remove('hidden');
            containerDiv.innerHTML = '';

            snapshot.forEach(doc => {
                const product = doc.data();
                product.id = doc.id;
                this.renderProductCard(product, containerDiv);
            });
        }, (error) => {
            console.error('Error loading products:', error);
            loadingDiv.classList.add('hidden');
            alert('Error loading products. Please refresh the page.');
        });
    }

    // Render product card
    renderProductCard(product, container) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition fade-in';
        card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" 
                 class="w-full h-48 object-cover" 
                 onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            <div class="p-4">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${this.escapeHtml(product.name)}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${this.escapeHtml(product.description)}</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-blue-600">₹${parseFloat(product.price).toFixed(2)}</span>
                    <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        <i class="fas fa-shopping-cart mr-2"></i>Buy Now
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    }

    // Load products in admin panel
    loadAdminProducts() {
        const adminList = document.getElementById('admin-products-list');
        
        this.productsRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            adminList.innerHTML = '';
            
            if (snapshot.empty) {
                adminList.innerHTML = '<p class="text-gray-500 text-center py-4">No products added yet</p>';
                return;
            }

            snapshot.forEach(doc => {
                const product = doc.data();
                product.id = doc.id;
                this.renderAdminProductItem(product, adminList);
            });
        });
    }

    // Render admin product item
    renderAdminProductItem(product, container) {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-4 bg-white border rounded-lg';
        item.innerHTML = `
            <div class="flex items-center space-x-4">
                <img src="${product.imageUrl}" alt="${product.name}" 
                     class="w-16 h-16 object-cover rounded"
                     onerror="this.src='https://via.placeholder.com/100'">
                <div>
                    <h4 class="font-semibold">${this.escapeHtml(product.name)}</h4>
                    <p class="text-gray-600">₹${parseFloat(product.price).toFixed(2)}</p>
                </div>
            </div>
            <button onclick="window.dbManager.deleteProduct('${product.id}')" 
                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
    }

    // Handle add product
    async handleAddProduct() {
        if (!window.authManager.isAdmin) {
            alert('Only admin can add products');
            return;
        }

        const name = document.getElementById('product-name').value.trim();
        const price = document.getElementById('product-price').value;
        const imageUrl = document.getElementById('product-image').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const errorDiv = document.getElementById('add-product-error');
        const successDiv = document.getElementById('add-product-success');

        // Validation
        if (!name || name.length < 3) {
            this.showError(errorDiv, 'Product name must be at least 3 characters');
            return;
        }

        if (!price || parseFloat(price) <= 0) {
            this.showError(errorDiv, 'Please enter a valid price');
            return;
        }

        if (!this.isValidUrl(imageUrl)) {
            this.showError(errorDiv, 'Please enter a valid image URL');
            return;
        }

        if (!description || description.length < 10) {
            this.showError(errorDiv, 'Description must be at least 10 characters');
            return;
        }

        try {
            errorDiv.classList.add('hidden');
            successDiv.classList.add('hidden');

            await this.productsRef.add({
                name: this.escapeHtml(name),
                price: parseFloat(price),
                imageUrl: imageUrl,
                description: this.escapeHtml(description),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: window.authManager.currentUser.email
            });

            document.getElementById('add-product-form').reset();
            this.showSuccess(successDiv, 'Product added successfully!');
            setTimeout(() => successDiv.classList.add('hidden'), 3000);
        } catch (error) {
            console.error('Error adding product:', error);
            this.showError(errorDiv, 'Error adding product. Please try again.');
        }
    }

    // Delete product
    async deleteProduct(productId) {
        if (!window.authManager.isAdmin) {
            alert('Only admin can delete products');
            return;
        }

        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await this.productsRef.doc(productId).delete();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product. Please try again.');
        }
    }

    // Helper functions
    showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    showSuccess(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// Initialize Database Manager
window.dbManager = new DatabaseManager();
