// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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
const database = getDatabase(app);
const dbRef = ref(database);

// Function to handle login
document.getElementById("loginButton").addEventListener("click", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        showModal("Please enter both username and password.");
        return;
    }

    try {
        const snapshot = await get(child(dbRef, "users/"));
        if (!snapshot.exists()) {
            console.error("No user data available");
            alert("Invalid username or password.");
            return;
        }

        let userFound = false;
        let statusAccepted = false;
        let userID = null;
        let userData = null;

        snapshot.forEach((childSnapshot) => {
            const currentUserData = childSnapshot.val();
            const currentUserID = childSnapshot.key;

            if (currentUserData.username === username && currentUserData.password === password) {
                userFound = true;
                userData = currentUserData;
                userID = currentUserID;

                if (currentUserData.status === "accepted") {
                    statusAccepted = true;
                }
            }
        });

        if (!userFound) {
            showModal("Invalid username or password.");
            return;
        }

        if (!statusAccepted) {
            showModal("Your account has not been accepted. Please wait for admin approval.");
            return;
        }

        // **Clear sessionStorage for new login**
        sessionStorage.clear();
        localStorage.clear();

        // **Store session data**
        sessionStorage.setItem("uid", userID);
        sessionStorage.setItem("username", userData.username);
        sessionStorage.setItem("role", userData.role); // Store user role
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("firstLogin", "true"); // Track first login

        console.log("Login successful:", userData);

        // **Redirect based on role**
        switch (userData.role) {
            case 0:
                window.location.href = "adminHome.html";
                break;
            case 1:
                window.location.href = "home.html";
                break;
            case 2:
                window.location.href = "superHome.html";
                break;
            default:
                showModal("Unknown role. Contact support.");
        }
    } catch (error) {
        console.error("Error fetching user data:", error.message);
        showModal("An error occurred. Please try again.");
    }
});


function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
}

function hideModal() {
    document.getElementById('alertModal').style.display = 'none';
}

// Close modal when user clicks the "X"
document.getElementById('closeModalBtn').addEventListener('click', hideModal);

