import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// BUG FIX: Added `query` and `where` imports needed for filtering by current user
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCYvy3GB1vNUPzGdClU1lEx0p-Ypwh996c",
    authDomain: "rentreach-947b7.firebaseapp.com",
    projectId: "rentreach-947b7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        renderLandlordUnits();
        renderBookings();
    } else {
        window.location.href = "login.html";
    }
});

// LOGOUT
document.getElementById("btnLogout")?.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "login.html");
});

// SHOW UNITS FROM FIREBASE
async function renderLandlordUnits() {
    const div = document.getElementById("landlordUnits");
    if (!div) return;

    div.innerHTML = "";

    // BUG FIX 1: Changed collection from "rentals" to "apartments" to match landlord-dashboard.html
    // BUG FIX 2: Filter by current user's ownerId so landlords only see their own units
    const q = query(collection(db, "apartments"), where("ownerId", "==", currentUser.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        div.innerHTML = '<p style="color:#94a3b8;">No units yet.</p>';
        return;
    }

    snapshot.forEach(docItem => {
        const data = docItem.data();

        const title = data.title || data.name || "No Title";
        const address = data.location || data.address || "No Address";
        const price = data.pricePerMonth || data.price || 0;

        div.innerHTML += `
            <div class="card">
                <h3>${title}</h3>
                <p>${address}</p>
                <p>₱${price}</p>
            </div>
        `;
    });
}

// BOOKINGS
async function renderBookings() {
    const div = document.getElementById("bookingRequests");
    if (!div) return;

    div.innerHTML = "";

    // BUG FIX: Filter bookings by landlordUid so each landlord only sees their own bookings
    const q = query(collection(db, "bookings"), where("landlordUid", "==", currentUser.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        div.innerHTML = '<p style="color:#94a3b8;">No booking requests.</p>';
        return;
    }

    snapshot.forEach(docItem => {
        const data = docItem.data();

        div.innerHTML += `
            <div class="card">
                <p>${data.unitName || "—"}</p>
                <p>${data.tenantEmail || "—"}</p>
            </div>
        `;
    });
}

// ADD UNIT
document.getElementById("addUnitForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // BUG FIX: Changed collection from "rentals" to "apartments"
    await addDoc(collection(db, "apartments"), {
        title: document.getElementById("unitName").value,
        location: document.getElementById("unitAddress").value,
        address: document.getElementById("unitAddress").value,
        pricePerMonth: Number(document.getElementById("unitPrice").value),
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email,
        landlordUid: currentUser.uid,
        landlordEmail: currentUser.email,
        isAvailable: true,
        status: "available",
        createdAt: Date.now()
    });

    renderLandlordUnits();
});