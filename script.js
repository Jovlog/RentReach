import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCYvy3GB1vNUPzGdClU1lEx0p-Ypwh996c",
    authDomain: "rentreach-947b7.firebaseapp.com",
    projectId: "rentreach-947b7",
    storageBucket: "rentreach-947b7.firebasestorage.app",
    messagingSenderId: "146021863979",
    appId: "1:146021863979:web:6e4029254dcc1e7563906e",
    measurementId: "G-VCM3MBQPMN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ================= PROTECT ADMIN PAGE =================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        let role = null;
        querySnapshot.forEach(docItem => {
            role = docItem.data().role;
        });

        if(role !== "admin") {
            alert("Access denied. You are not an admin.");
            window.location.href = "login.html";
        } else {
            // Load admin sections
            if(document.getElementById("userTableBody")) loadUsers();
            if(document.getElementById("propertyList")) loadProperties();
            if(document.getElementById("adminEmail")) loadProfile();
            if(document.getElementById("createAdminForm")) initCreateAdmin();
        }
    }
});

// ================= LOGOUT =================
document.querySelectorAll("#btnLogout").forEach(btn => {
    btn.addEventListener("click", () => {
        signOut(auth).then(() => window.location.href="login.html");
    });
});

// ================= LOAD USERS =================
async function loadUsers() {
    const table = document.getElementById("userTableBody");
    if(!table) return;
    const snapshot = await getDocs(collection(db, "users"));
    table.innerHTML = "";
    snapshot.forEach(docItem => {
        const user = docItem.data();
        table.innerHTML += `<tr><td>${user.email}</td><td>${user.role}</td></tr>`;
    });
}

// ================= LOAD PROPERTIES =================
async function loadProperties() {
    const container = document.getElementById("propertyList");
    if(!container) return;
    // BUG FIX: Changed collection from "rentals" to "apartments" to match what landlord-dashboard writes
    const snapshot = await getDocs(collection(db, "apartments"));
    container.innerHTML = "";
    snapshot.forEach(docItem => {
        const data = docItem.data();
        const id = docItem.id;
        // BUG FIX: Updated field names to match apartments collection schema
        const title = data.title || data.name || "Untitled Property";
        const price = data.pricePerMonth || data.price || 0;
        container.innerHTML += `
            <div class="card">
                <h3>${title}</h3>
                <p>₱${price}</p>
                <button class="btn-delete" onclick="deleteProperty('${id}')">Delete</button>
            </div>
        `;
    });
}

// ================= DELETE PROPERTY =================
window.deleteProperty = async function(id) {
    const confirmDelete = confirm("Delete this property?");
    if(!confirmDelete) return;
    // BUG FIX: Changed collection from "rentals" to "apartments"
    await deleteDoc(doc(db, "apartments", id));
    loadProperties();
}

// ================= LOAD PROFILE =================
function loadProfile() {
    const emailSpan = document.getElementById("adminEmail");
    if(!emailSpan) return;
    emailSpan.innerText = auth.currentUser.email;
}

// ================= CREATE ADMIN =================
function initCreateAdmin() {
    const form = document.getElementById("createAdminForm");
    const statusEl = document.getElementById("createAdminStatus");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("newAdminEmail").value;
        const password = document.getElementById("newAdminPassword").value;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: email,
                role: "admin",
                createdAt: Date.now()
            });
            statusEl.innerText = "Admin account created successfully!";
            form.reset();
            loadUsers();
        } catch(error) {
            console.error(error);
            statusEl.innerText = "Error: " + error.message;
        }
    });
}