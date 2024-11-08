// Import the functions you need from the SDKs you need
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

// Log the entire database to the console for debugging
const dbRef = ref(database);
get(child(dbRef, '/')).then((snapshot) => {
    if (snapshot.exists()) {
        // Log entire database data
        console.log("Database data:", snapshot.val());
    } else {
        console.error("No data available");
    }
}).catch((error) => {
    console.error("Error fetching database data:", error.message);
});

// Function to handle login
document.getElementById("loginButton").addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Retrieve user data from the database
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
            let userFound = false;

            // Loop through each user node (user's unique ID)
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const userID = childSnapshot.key;
                console.log("User data:", userData); // Log each user's data

                if (userData.username === username && userData.password === password) {
                    userFound = true;
                    console.log("Login successful:", userData);

                    // Store session data using sessionStorage
                    sessionStorage.setItem("uid", userID);
                    sessionStorage.setItem("username", userData.username);
                    sessionStorage.setItem("role", userData.role); // Store user role
                    sessionStorage.setItem("isLoggedIn", true);

                    // Redirect based on role
                    if (userData.role === 0) {
                        // Redirect to admin home page
                        window.location.href = "adminHome.html";
                    } else if (userData.role === 1) {
                        // Redirect to regular home page
                        sessionStorage.removeItem("vulnerabilitiesData");


                        window.location.href = "home.html";
                    } else if (userData.role === 2) {
                        // Optionally handle role 2 if needed
                        sessionStorage.removeItem("vulnerabilitiesData");

                        window.location.href = "home.html"; // Change this if you want a different page for role 2
                    }
                }
            });

            if (!userFound) {
                console.error("Invalid username or password");
                // Handle invalid credentials here (e.g., display an error message)
            }
        } else {
            console.error("No user data available");
        }
    }).catch((error) => {
        console.error("Error fetching user data:", error.message);
    });
});
