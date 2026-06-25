// =====================================================
// 🎮 MAIN CONTROLLER — Saari files ko initialize karta hai
// =====================================================

import { watchAuthState, signInUser, signUpUser, logOutUser } from "./auth-logic.js";
import { addProduct, fetchProducts, deleteProduct } from "./db-logic.js";
import { isAdminUser } from "./firebase-config.js";

// ============ DOM ELEMENTS ============
const $ = (id) => document.getElementById(id);

const dom = {
  guestButtons: $("guestButtons"),
  userButtons: $("userButtons"),
  userEmail: $("userEmail"),
  btnLogin: $("btnLogin"),
  btnSignup: $("btnSignup"),
  btnLogout: $("btnLogout"),

  adminPanel: $("adminPanel"),
  productForm: $("productForm"),
  btnAddProduct: $("btnAddProduct"),
  addBtnText: $("addBtnText"),
  addBtnLoader: $("addBtnLoader"),

  productGrid: $("productGrid"),
  emptyState: $("emptyState"),

  authModal: $("authModal"),
  modalTitle: $("modalTitle"),
  authForm: $("authForm"),
  authEmail: $("authEmail"),
  authPassword: $("authPassword"),
  authSubmitBtn: $("authSubmitBtn"),
  authError: $("authError"),
  toggleAuth: $("toggleAuth"),
  toggleText: $("toggleText"),
  closeModal: $("closeModal"),

  toast: $("toast")
};

// ============ STATE ============
let currentUser = null;
let authMode = "login"; // "login" or "signup"

// ============ TOAST ============
const showToast = (message, duration = 3000) => {
  dom.toast.textContent = message;
  dom.toast.classList.remove("hidden");
  setTimeout(() => dom.toast.classList.add("hidden"), duration);
};

// ============ AUTH UI TOGGLE ============
const setAuthMode = (mode) => {
  authMode = mode;
  if (mode === "login") {
    dom.modalTitle.textContent = "Login";
    dom.authSubmitBtn.textContent = "Login";
    dom.toggleText.textContent = "Don't have an account?";
    dom.toggleAuth.textContent = "Sign Up";
  } else {
    dom.modalTitle.textContent = "Sign Up";
    dom.authSubmitBtn.textContent = "Create Account";
    dom.toggleText.textContent = "Already have an account?";
    dom.toggleAuth.textContent = "Login";
  }
  dom.authError.classList.add("hidden");
};

const openModal = (mode) => {
  setAuthMode(mode);
  dom.authForm.reset();
  dom.authModal.classList.remove("hidden");
};

const closeModal = () => dom.authModal.classList.add("hidden");

// ============ UI UPDATE ON AUTH CHANGE ============
const updateUIForUser = (user) => {
  currentUser = user;

  if (user) {
    dom.guestButtons.classList.add("hidden");
    dom.userButtons.classList.remove("hidden");
    dom.userEmail.textContent = `👤 ${user.email}`;

    // 🎯 Admin panel sirf admin email par hi visible hoga
    if (isAdminUser(user)) {
      dom.adminPanel.classList.remove("hidden");
    } else {
      dom.adminPanel.classList.add("hidden");
    }
  } else {
    dom.guestButtons.classList.remove("hidden");
    dom.userButtons.classList.add("hidden");
    dom.userEmail.textContent = "";
    dom.adminPanel.classList.add("hidden");
    currentUser = null;
  }
};

// ============ RENDER PRODUCTS ============
const renderProducts = (products) => {
  if (!products || products.length === 0) {
    dom.productGrid.innerHTML = "";
    dom.emptyState.classList.remove("hidden");
    return;
  }

  dom.emptyState.classList.add("hidden");

  dom.productGrid.innerHTML = products.map(p => {
    const price = Number(p.price || 0).toLocaleString("en-IN");
    const isAdmin = isAdminUser(currentUser);
    const deleteBtn = isAdmin
      ? `<button data-id="${p.id}" class="delete-btn text-xs text-red-500 hover:text-red-700 mt-2">🗑️ Delete</button>`
      : "";

    return `
      <div class="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden fade-in flex flex-col">
        <div class="aspect-square bg-gray-100 overflow-hidden">
          <img src="${p.imageUrl}" alt="${p.name}"
               onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'"
               class="w-full h-full object-cover hover:scale-105 transition" loading="lazy" />
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <span class="text-xs text-indigo-600 font-semibold uppercase">${p.category || "General"}</span>
          <h4 class="font-bold text-lg mt-1 line-clamp-1">${p.name}</h4>
          <p class="text-sm text-gray-600 mt-1 line-clamp-2 flex-1">${p.description || ""}</p>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xl font-bold text-green-600">₹${price}</span>
            <button class="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">Buy Now</button>
          </div>
          ${deleteBtn}
        </div>
      </div>
    `;
  }).join("");

  // Delete button listeners (admin only)
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!confirm("Kya aap sach mein ye product delete karna chahte hain?")) return;
      const res = await deleteProduct(id, currentUser);
      if (res.success) showToast("✅ Product deleted");
      else showToast("❌ " + res.message);
    });
  });
};

// ============ EVENT LISTENERS ============

// Navbar buttons
dom.btnLogin.addEventListener("click", () => openModal("login"));
dom.btnSignup.addEventListener("click", () => openModal("signup"));
dom.btnLogout.addEventListener("click", async () => {
  const res = await logOutUser();
  if (res.success) showToast("👋 Logged out successfully");
});

// Modal controls
dom.closeModal.addEventListener("click", closeModal);
dom.authModal.addEventListener("click", (e) => {
  if (e.target === dom.authModal) closeModal();
});
dom.toggleAuth.addEventListener("click", () => {
  setAuthMode(authMode === "login" ? "signup" : "login");
});

// Auth form submit
dom.authForm.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = dom.authEmail.value.trim();
  const password = dom.authPassword.value;

  if (!email || !password) return;

  dom.authSubmitBtn.disabled = true;
  dom.authSubmitBtn.textContent = "Please wait...";
  dom.authError.classList.add("hidden");

  const result = authMode === "login"
    ? await signInUser(email, password)
    : await signUpUser(email, password);

  dom.authSubmitBtn.disabled = false;
  setAuthMode(authMode); // reset button text

  if (result.success) {
    closeModal();
    showToast(authMode === "login" ? "✅ Login successful" : "🎉 Account created!");
  } else {
    dom.authError.textContent = result.message;
    dom.authError.classList.remove("hidden");
  }
});

// Add product form
dom.productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser || !isAdminUser(currentUser)) {
    showToast("❌ Sirf admin hi product add kar sakta hai");
    return;
  }

  const productData = {
    name: $("pName").value,
    category: $("pCategory").value,
    price: $("pPrice").value,
    imageUrl: $("pImage").value,
    description: $("pDesc").value
  };

  dom.addBtnText.classList.add("hidden");
  dom.addBtnLoader.classList.remove("hidden");
  dom.btnAddProduct.disabled = true;

  const res = await addProduct(productData, currentUser);

  dom.addBtnText.classList.remove("hidden");
  dom.addBtnLoader.classList.add("hidden");
  dom.btnAddProduct.disabled = false;

  if (res.success) {
    showToast("✅ Product added successfully!");
    dom.productForm.reset();
  } else {
    showToast("❌ " + res.message);
  }
});

// ============ INITIALIZE APP ============
const initApp = () => {
  console.log("🚀 Online Bazaar66 initializing...");

  // 1. Auth state watcher
  watchAuthState((user) => {
    updateUIForUser(user);
  });

  // 2. Real-time products listener
  fetchProducts(renderProducts);

  console.log("✅ App ready!");
};

// DOM ready hone par start karo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
