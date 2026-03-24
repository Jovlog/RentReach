import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

// ================= AUTH CHECK =================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadUsers();
        loadRentals();
        const adminEmailEl = document.getElementById("adminEmail");
        if (adminEmailEl) adminEmailEl.innerText = user.email;
    }
});

// ================= LOGOUT =================
document.querySelectorAll("#btnLogout").forEach(btn => {
    btn.addEventListener("click", () => {
        signOut(auth).then(() => window.location.href = "login.html");
    });
});

// ================= LOAD USERS =================
function loadUsers() {
    const table = document.getElementById("userTableBody");
    if (!table) return;

    onSnapshot(collection(db, "users"), (snapshot) => {
        table.innerHTML = "";
        snapshot.forEach(docItem => {
            const user = docItem.data();
            table.innerHTML += `
                <tr>
                    <td>${user.email || "—"}</td>
                    <td>${user.role || "—"}</td>
                </tr>
            `;
        });
    });
}

// ================= LOAD RENTALS =================
function loadRentals() {
    const container = document.getElementById("propertyList");
    if (!container) return;

    // BUG FIX: Changed collection from "rentals" to "apartments" to match
    // the collection landlord-dashboard.html writes to.
    onSnapshot(collection(db, "apartments"), (snapshot) => {
        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = `<p style="color:#888;padding:20px;">No properties found.</p>`;
            return;
        }

        snapshot.forEach(docItem => {
            const data = docItem.data();
            const id = docItem.id;

            // BUG FIX: Updated field names to match apartments collection schema
            const imgUrls = data.imageUrls || [];
            const imageUrl = (Array.isArray(imgUrls) && imgUrls.length > 0)
                ? imgUrls[0]
                : (data.imageUrl || data.image || null);

            const title = data.title || data.name || "Untitled Property";
            const address = data.location || data.address || "No address provided";
            const price = data.pricePerMonth || data.price || 0;
            const landlord = data.ownerEmail || data.landlordEmail || "";

            const imgHtml = imageUrl
                ? `<img src="${imageUrl}" alt="Property Image" class="property-img"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                   <div class="property-img-placeholder" style="display:none;">📷 No Image</div>`
                : `<div class="property-img-placeholder">📷 No Image</div>`;

            container.innerHTML += `
                <div class="property-card" id="card-${id}">
                    <div class="property-img-wrapper">${imgHtml}</div>
                    <div class="property-details">
                        <h3 class="property-title">${title}</h3>
                        <p class="property-address">📍 ${address}</p>
                        <p class="property-price">₱${Number(price).toLocaleString()}/mo</p>
                        ${landlord ? `<p class="property-landlord">👤 ${landlord}</p>` : ""}
                    </div>
                    <div class="property-actions">
                        <button class="btn-delete" onclick="deleteProperty('${id}')">🗑 Delete</button>
                    </div>
                </div>
            `;
        });
    });
}

// ================= DELETE PROPERTY =================
window.deleteProperty = async function(id) {
    const confirmDelete = confirm("Are you sure you want to delete this property? This cannot be undone.");
    if (!confirmDelete) return;

    try {
        // BUG FIX: Changed collection from "rentals" to "apartments"
        await deleteDoc(doc(db, "apartments", id));
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete: " + err.message);
    }
};