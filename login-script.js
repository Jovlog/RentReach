import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYvy3GB1vNUPzGdClU1lEx0p-Ypwh996c",
  authDomain: "rentreach-947b7.firebaseapp.com",
  projectId: "rentreach-947b7",
  storageBucket: "rentreach-947b7.firebasestorage.app",
  messagingSenderId: "146021863979",
  appId: "1:146021863979:web:6e4029254dcc1e7563906e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const btn = document.getElementById("btnLogin");
const errDiv = document.getElementById("errorMessage");

async function doLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showErr("Please enter your email and password.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Signing in...";
  errDiv.classList.remove("show");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    let role = "renter";

    const q1 = query(collection(db, "users"), where("uid", "==", cred.user.uid));
    const s1 = await getDocs(q1);
    if (!s1.empty) {
      s1.forEach(d => { role = d.data().role; });
    } else {
      const q2 = query(collection(db, "users"), where("email", "==", cred.user.email));
      const s2 = await getDocs(q2);
      s2.forEach(d => { role = d.data().role; });
    }

    if (role === "admin") window.location.href = "admin.html";
    else if (role === "landlord") window.location.href = "landlord-dashboard.html";
    else window.location.href = "renter.html";

  } catch (err) {
    let msg = "Login failed. Check your credentials.";
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") msg = "Wrong email or password.";
    if (err.code === "auth/too-many-requests") msg = "Too many attempts. Try again later.";
    showErr(msg);
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

function showErr(msg) {
  errDiv.textContent = msg;
  errDiv.classList.add("show");
}

btn.addEventListener("click", doLogin);
document.addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });