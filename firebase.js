// BUG FIX: This file was completely empty. Added shared Firebase config
// so it can be imported by any page instead of duplicating the config everywhere.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYvy3GB1vNUPzGdClU1lEx0p-Ypwh996c",
  authDomain: "rentreach-947b7.firebaseapp.com",
  projectId: "rentreach-947b7",
  storageBucket: "rentreach-947b7.firebasestorage.app",
  messagingSenderId: "146021863979",
  appId: "1:146021863979:web:6e4029254dcc1e7563906e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);