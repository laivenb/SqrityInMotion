import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
    getDatabase, ref, push, set, query, orderByChild, equalTo, get
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
const database = getDatabase(app);

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// Handle registration button click
document.getElementById("registerButton").addEventListener("click", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    let email = document.getElementById("email").value.toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (!isPasswordStrong(password)) {
        alert("Password must be at least 15 characters long, include uppercase, lowercase, a number, and a special character.");
        return;
    }

    // Check if user already exists
    const userExists = await checkUserExists(username, email);
    if (userExists) {
        alert("Username or email already exists. Please choose a different one.");
        return;
    }

    // Generate a new unique user key using push()
    const newUserRef = push(ref(database, "users"));
    const userId = newUserRef.key; // Get the generated unique key

    // Save user data
    set(ref(database, "users/" + userId), {
        firstName: document.getElementById("firstName").value,
        middleName: document.getElementById("middleName").value,
        lastName: document.getElementById("lastName").value,
        username: username,
        email: email,
        password: password,
        contactNumber: document.getElementById("contactNumber").value,
        company: document.getElementById("company").value,
        department: document.getElementById("department").value,
        position: document.getElementById("position").value,
        birthday: document.getElementById("birthday").value,
        status: "pending",
        role: 1,
        requestDate: getCurrentDate()
    })
        .then(() => {
            alert("Registration successful. Awaiting admin approval.");
            console.log("User data saved successfully with ID:", userId);
        })
        .catch((error) => {
            console.error("Error writing user data:", error);
        });
});

// Function to check if user already exists (by username or email)
async function checkUserExists(username, email) {
    email = email.toLowerCase();

    const usernameQuery = query(ref(database, "users"), orderByChild("username"), equalTo(username));
    const emailQuery = query(ref(database, "users"), orderByChild("email"), equalTo(email));

    try {
        const usernameSnapshot = await get(usernameQuery);
        const emailSnapshot = await get(emailQuery);
        return usernameSnapshot.exists() || emailSnapshot.exists();
    } catch (error) {
        console.error("Error checking if user exists:", error);
        return false;
    }
}

// Function to validate password strength
function isPasswordStrong(password) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const isValidLength = password.length >= 15;
    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar && isValidLength;
}
