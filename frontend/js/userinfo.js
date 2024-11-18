// Import Firebase modules
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

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem("username");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn && currentUser) {
        // Fetch user information from Firebase
        fetchUserInfo(currentUser);
    } else {
        alert("You are not logged in. Please log in first.");
        window.location.href = "login.html"; // Redirect to login page
    }
});

// Function to fetch user information from Firebase
function fetchUserInfo(username) {
    const dbRef = ref(database);
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
            let userFound = false;

            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();

                if (userData.username === username) {
                    userFound = true;
                    populateUserInfo(userData); // Call function to populate user info on the page
                }
            });

            if (!userFound) {
                console.error("User not found in Firebase");
                alert("User not found. Please check your username.");
            }
        } else {
            console.error("No user data available");
            alert("No user data available.");
        }
    }).catch((error) => {
        console.error("Error fetching user data:", error.message);
        alert("Error fetching user data.");
    });
}

// Function to populate user information fields
function populateUserInfo(user) {
    console.log("User data being populated:", user); // Debug log
    document.getElementById("first-name").value = user.firstName || '';
    document.getElementById("middle-name").value = user.middleName || '';
    document.getElementById("last-name").value = user.lastName || '';
    document.getElementById("user-name").value = user.username || '';
    document.getElementById("email").value = user.email || '';
    document.getElementById("contact-number").value = user.contactNumber || '';
    document.getElementById("department").value = user.department || '';
    document.getElementById("role").value = user.role || '';

}
