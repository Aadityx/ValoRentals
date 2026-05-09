/* ============================================
   Firebase Configuration
   ============================================
   This file initializes Firebase services:
   - Firebase App
   - Firebase Authentication  
   - Firebase Firestore Database
   ============================================ */

// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbk2XGbZsFYra_LqkhR394MrK9u7WZ4Xw",
  authDomain: "valo-rentals.firebaseapp.com",
  databaseURL: "https://valo-rentals-default-rtdb.firebaseio.com",
  projectId: "valo-rentals",
  storageBucket: "valo-rentals.firebasestorage.app",
  messagingSenderId: "163889709589",
  appId: "1:163889709589:web:244ed8ed92e4fa616ac41c",
  measurementId: "G-34M4X92BCE"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication - handles user login/signup
const auth = getAuth(app);

// Initialize Firestore Database - stores bookings, payments, user data
const db = getFirestore(app);

// Export all Firebase services and methods for use in other modules
export {
  auth,
  db,
  // Auth methods
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // Firestore methods
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc
};
