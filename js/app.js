// ============================================
// 🚀 MAIN APPLICATION CONTROLLER
// ============================================

class App {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Online Bazaar66 starting...');
        
        // Wait for Firebase to be ready
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            this.startApp();
        } else {
            console.error('Firebase not initialized. Check firebase-config.js');
            alert('Error: Firebase not configured. Please check firebase-config.js');
        }
    }

    startApp() {
        console.log('✅ App initialized successfully');
        
        // Load products
        if (window.dbManager) {
            window.dbManager.loadProducts();
        }

        // Close modals when clicking outside
        this.setupModalCloseHandlers();
    }

    setupModalCloseHandlers() {
        const modals = ['login-modal', 'signup-modal', 'admin-modal'];
        
        modals.forEach(modalId => {
            document.getElementById(modalId).addEventListener('click', (e) => {
                if (e.target.id === modalId) {
                    document.getElementById(modalId).classList.add('hidden');
                }
            });
        });
    }
}

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
