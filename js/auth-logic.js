// =====================================================
// 🔐 AUTHENTICATION LOGIC (Firebase Auth)
// =====================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./firebase-config.js";

/**
 * 📝 Naya user register karein
 */
export const signUpUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, message: cleanAuthError(error.code) };
  }
};

/**
 * 🔑 Existing user login
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, message: cleanAuthError(error.code) };
  }
};

/**
 * 🚪 Logout
 */
export const logOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, message: cleanAuthError(error.code) };
  }
};

/**
 * 👂 Auth state listener (login/logout detect karne ke liye)
 */
export const watchAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * 🧹 Firebase error codes ko user-friendly messages mein convert karein
 */
const cleanAuthError = (code) => {
  const messages = {
    "auth/email-already-in-use": "Ye email pehle se registered hai.",
    "auth/invalid-email": "Invalid email format.",
    "auth/weak-password": "Password kam se kam 6 characters ka hona chahiye.",
    "auth/user-not-found": "User nahi mila. Pehle sign up karein.",
    "auth/wrong-password": "Galat password.",
    "auth/invalid-credential": "Email ya password galat hai.",
    "auth/too-many-requests": "Bahut zyada attempts. Thodi der baad try karein.",
    "auth/network-request-failed": "Network error. Internet check karein."
  };
  return messages[code] || "Kuch gadbad ho gayi. Dobara try karein.";
};
