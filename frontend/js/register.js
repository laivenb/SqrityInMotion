import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, set, push, child, get, query, orderByChild, orderByKey, equalTo, limitToLast } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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
        alert("Password must be at least 15 characters long, include uppercase, lowercase, a number, and a special character.");
        return;
    }

    // Check if user already exists
    const userExists = await checkUserExists(username, email);
    if (userExists) {
        alert("Username or email already exists. Please choose a different one.");
        return;
    }

    // Generate custom user ID with date and continuous incremental counter
    const userId = await generateCustomUserId();

    // Register user with default status as "pending" and role as 1
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
        status: "pending", // Registration pending approval
        role: 1,
        requestDate: getCurrentDate()
    })
        .then(() => {
            alert("Registration successful. Awaiting admin approval.");
            console.log("User data saved successfully with ID: " + userId);
        })
        .catch((error) => {
            console.error("Error writing user data: ", error);
        });
});

// Function to generate custom user ID with continuous increment
async function generateCustomUserId() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const datePart = `01${month}${day}${year}`;

    // Query to find the last user ID in the database
    const userQuery = query(ref(database, "users"), orderByKey(), limitToLast(1));
    const snapshot = await get(userQuery);

    let increment = 1;

    if (snapshot.exists()) {
        const lastUserId = Object.keys(snapshot.val())[0];
        const lastIncrement = lastUserId.split('_')[0].slice(-4);
        increment = parseInt(lastIncrement, 10) + 1;
    }


    const incrementedPart = String(increment).padStart(4, '0');
    const key = generateRandomKey();


    return `${datePart}${incrementedPart}_${key}`;
}

// Function to generate a random key (for security)
function generateRandomKey() {
    return Math.random().toString(36).substring(2, 15);
}



// Function to check if user already exists
async function checkUserExists(username, email) {
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


// Function to validate password strength based on NIST guidelines

function isPasswordStrong(password) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const isValidLength = password.length >= 15; // Minimum 15 characters

    // Log the individual checks for debugging
    console.log("Has lowercase letter:", hasLowercase);
    console.log("Has uppercase letter:", hasUppercase);
    console.log("Has digit:", hasDigit);
    console.log("Has special character:", hasSpecialChar);
    console.log("Valid length (>= 15):", isValidLength);

    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar && isValidLength;
}




/*
Role Guide:
- Admin (0): Full access (accept/reject registrations, account records).
- Vulnerability Analyst & Penetration Tester (1): Authorized for nmap and pentesting.
- Read-Only User (2): Can view/download reports, no access for scanning/pentesting.
*/

