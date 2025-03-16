import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGRcp5vGb3jkEHQRLqpteltbjKalDYb00",
    authDomain: "sqrity-f02ee.firebaseapp.com",
    projectId: "sqrity-f02ee",
    storageBucket: "sqrity-f02ee.appspot.com",
    messagingSenderId: "299895044214",
    appId: "1:299895044214:web:b9da099b6067dfb8974757",
    databaseURL: "https://sqrity-f02ee-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const BASE_URL = 'http://192.168.68.64:5000';



// Ensure elements exist before updating them
function updateElementText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element ${selector} not found.`);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const currentUser = sessionStorage.getItem("uid");
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    console.log("Logged in as:", currentUser);
    // Fetch user stats
    await getTotalUsers();
    await getTotalRequests();
});

// Function to fetch total users
async function getTotalUsers() {
    try {
        const snapshot = await get(ref(db, "users"));
        if (snapshot.exists()) {
            const totalUsers = snapshot.size;
            updateElementText("#total-users", totalUsers);
        } else {
            updateElementText("#total-users", "0");
        }
    } catch (error) {
        console.error("Error fetching total users:", error);
    }
}

// Function to fetch total pending requests
async function getTotalRequests() {
    try {
        const queryRef = query(ref(db, "users"), orderByChild("status"), equalTo("pending"));
        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            const totalRequests = snapshot.size;
            updateElementText("#total-requests", totalRequests);
        } else {
            updateElementText("#total-requests", "0");
        }
    } catch (error) {
        console.error("Error fetching pending requests:", error);
    }
}
