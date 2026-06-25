// ============================================
// 🔥 FIREBASE CONFIGURATION
// ============================================
// Yahan apni Firebase console se configuration paste karein
// Firebase Console > Project Settings > General > Your apps > Web app

const firebaseConfig = {
    apiKey: "AIzaSyAsTYWehPz9QGpK9hIjNY_TBY456rzcKoA",
    authDomain: "onlinebazaar66.firebaseapp.com",
    projectId: "onlinebazaar66",
    storageBucket: "onlinebazaar66.firebasestorage.app",
    messagingSenderId: "741329003167",
    appId: "1:741329003167:web:b42b8937d5152083b6f8aa"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Admin email - yeh email wala user hi products add/delete kar sakta hai
const ADMIN_EMAIL = "Rahulkunar74089008@gmail.com";

console.log("✅ Firebase initialized successfully");
