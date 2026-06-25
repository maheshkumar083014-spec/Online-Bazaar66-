// ============================================
// 🔐 AUTHENTICATION LOGIC
// ============================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.setupEventListeners();
        this.checkAuthState();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Login button
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showModal('login-modal');
        });

        // Signup button
        document.getElementById('signup-btn').addEventListener('click', () => {
            this.showModal('signup-modal');
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Close modals
        document.getElementById('close-login').addEventListener('click', () => {
            this.hideModal('login-modal');
        });

        document.getElementById('close-signup').addEventListener('click', () => {
            this.hideModal('signup-modal');
        });

        // Login form submit
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form submit
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    }

    // Check authentication state on page load
    checkAuthState() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.isAdmin = (user.email === ADMIN_EMAIL);
                this.updateUIForLoggedInUser();
            } else {
                this.currentUser = null;
                this.isAdmin = false;
                this.updateUIForLoggedOutUser();
            }
        });
    }

    // Handle login
    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        // Validation
        if (!this.validateEmail(email)) {
            this.showError(errorDiv, 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError(errorDiv, 'Password must be at least 6 characters');
            return;
        }

        try {
            errorDiv.classList.add('hidden');
            await auth.signInWithEmailAndPassword(email, password);
            this.hideModal('login-modal');
            document.getElementById('login-form').reset();
        } catch (error) {
            this.showError(errorDiv, this.getErrorMessage(error.code));
        }
    }

    // Handle signup
    async handleSignup() {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorDiv = document.getElementById('signup-error');

        // Validation
        if (!this.validateEmail(email)) {
            this.showError(errorDiv, 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError(errorDiv, 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError(errorDiv, 'Passwords do not match');
            return;
        }

        try {
            errorDiv.classList.add('hidden');
            await auth.createUserWithEmailAndPassword(email, password);
            this.hideModal('signup-modal');
            document.getElementById('signup-form').reset();
        } catch (error) {
            this.showError(errorDiv, this.getErrorMessage(error.code));
        }
    }

    // Logout
    async logout() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('user-section').classList.remove('hidden');
        document.getElementById('user-email').textContent = this.currentUser.email;

        // Show admin panel button if user is admin
        const adminBtn = document.getElementById('admin-panel-btn');
        if (this.isAdmin) {
            adminBtn.classList.remove('hidden');
            adminBtn.addEventListener('click', () => {
                this.showModal('admin-modal');
                if (window.dbManager) {
                    window.dbManager.loadAdminProducts();
                }
            });
        } else {
            adminBtn.classList.add('hidden');
        }
    }

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('user-section').classList.add('hidden');
        document.getElementById('admin-panel-btn').classList.add('hidden');
    }

    // Helper functions
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    getErrorMessage(errorCode) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/weak-password': 'Password is too weak',
            'auth/user-not-found': 'User not found',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many attempts. Please try again later'
        };
        return messages[errorCode] || 'An error occurred. Please try again';
    }
}

// Initialize Auth Manager
window.authManager = new AuthManager();
