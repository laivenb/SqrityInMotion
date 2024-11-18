// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, get, child, set, update } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

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
const storage = getStorage(app);

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

    // Handle profile picture upload
    const fileInput = document.getElementById("file-input");
    const editLink = document.getElementById("edit-link");

    // Trigger file input when edit link is clicked
    editLink.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        fileInput.click(); // Trigger the hidden file input
    });

    // Handle file input change
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadProfilePicture(file, currentUser); // Upload profile picture
        }
    });

    // Handle Save button click
    const saveButton = document.querySelector(".btn-primary");
    saveButton.addEventListener("click", () => {
        updateUserData(currentUser); // Update contact number when Save button is clicked
    });
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

    const profilePictureElement = document.getElementById("profile-picture");
    if (profilePictureElement) {
        profilePictureElement.src = user.profilePicture || './icons/default-profpic.webp'; // Use default if profilePicture is null
    } else {
        console.warn("Profile picture element not found in DOM.");
    }
}

// Function to handle profile picture upload and update the database



// Function to update user data in Firebase Realtime Database (only contact number)
function updateUserData(username) {
    const contactNumber = document.getElementById("contact-number").value;
    const userUID = sessionStorage.getItem("uid");

    // Check if userUID is available
    if (userUID) {
        // Reference to the user's data in the database
        const userRef = ref(database, `users/${userUID}`);
        try {
            // Update only the contact number in the existing user data
            update(userRef, {
                contactNumber: contactNumber
            });
            console.log(`Contact Number updated to ${contactNumber} for user with UID: ${userUID}`);
        } catch (error) {
            console.error("Error updating user contact number:", error);
        }
    } else {
        // Log when UID is not found
        console.log("Cannot update contact number - UID not found");
    }
}
