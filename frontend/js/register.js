import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, set, push, child, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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

const registerButton = document.getElementById("registerButton");
registerButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Check if password is strong
    if (!isPasswordStrong(password)) {
        alert("Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.");
        return;
    }

    // Check if user already exists
    const userExists = await checkUserExists(username, email);
    if (userExists) {
        alert("Username or email already exists. Please choose a different one.");
        return;
    }

    // Register user with default status as "pending" and role as 1
    const userId = push(child(ref(database), 'users/')).key;
    set(ref(database, "users/" + userId), {
        firstName: document.getElementById("firstName").value,
        middleName: document.getElementById("middleName").value, // Include middle name
        lastName: document.getElementById("lastName").value,
        username: username,
        email: email,
        password: password, // Storing passwords in plaintext is not recommended in production
        contactNumber: document.getElementById("contactNumber").value,
        company: document.getElementById("company").value,
        department: document.getElementById("department").value,
        position: document.getElementById("position").value,
        birthday: document.getElementById("birthday").value,
        status: "pending", // Registration pending approval
        role: 1 // Default role set to Vulnerability Analyst & Penetration Tester
    })
        .then(() => {
            alert("Registration successful. Awaiting admin approval.");
            console.log("User data saved successfully with ID: " + userId);
        })
        .catch((error) => {
            console.error("Error writing user data: ", error);
        });
});

// Function to check if user already exists
async function checkUserExists(username, email) {
    const usernameQuery = query(ref(database, "users"), orderByChild("username"), equalTo(username));
    const emailQuery = query(ref(database, "users"), orderByChild("email"), equalTo(email));

    const usernameSnapshot = await get(usernameQuery);
    const emailSnapshot = await get(emailQuery);

    return usernameSnapshot.exists() || emailSnapshot.exists();
}

// Function to validate password strength
function isPasswordStrong(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

/*
Role Guide:
- Admin (0): Full access (accept/reject registrations, account records).
- Vulnerability Analyst & Penetration Tester (1): Authorized for nmap and pentesting.
- Read-Only User (2): Can view/download reports, no access for scanning/pentesting.
*/
