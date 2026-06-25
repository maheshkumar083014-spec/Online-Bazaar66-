// =====================================================
// 💾 DATABASE LOGIC (Firestore)
// =====================================================

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, isAdminUser } from "./firebase-config.js";

const PRODUCTS_COLLECTION = "products";

/**
 * ➕ Add new product (Sirf Admin ke liye)
 * @param {Object} productData - { name, price, description, imageUrl, category }
 * @param {Object} user - Firebase auth user object
 */
export const addProduct = async (productData, user) => {
  // 🔒 Security check: sirf admin hi add kar sakta hai
  if (!isAdminUser(user)) {
    return { success: false, message: "Access denied. Sirf admin product add kar sakta hai." };
  }

  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      name: productData.name.trim(),
      price: Number(productData.price),
      description: productData.description.trim(),
      imageUrl: productData.imageUrl.trim(),
      category: (productData.category || "General").trim(),
      createdAt: serverTimestamp(),
      addedBy: user.email
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add product error:", error);
    return { success: false, message: "Product add nahi ho paya. " + error.message };
  }
};

/**
 * 🔄 Real-time products listener
 * Jab bhi koi product add/delete/update hoga, ye automatically UI update karega
 * @param {Function} callback - (productsArray) => void
 * @returns {Function} unsubscribe function
 */
export const fetchProducts = (callback) => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(products);
    }, (error) => {
      console.error("Fetch products error:", error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Listener setup error:", error);
    return () => {};
  }
};

/**
 * 🗑️ Delete product (Admin only)
 */
export const deleteProduct = async (productId, user) => {
  if (!isAdminUser(user)) {
    return { success: false, message: "Access denied." };
  }
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: "Delete nahi ho paya." };
  }
};
