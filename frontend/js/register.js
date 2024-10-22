import { getDatabase, ref, set, push, child } from "firebase/database"; // Ensure all necessary imports
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUJi49LkR9xxLSX5afKZLjZFwlPMmfzg0",
    authDomain: "capstone-ed286.firebaseapp.com",
    databaseURL: "https://capstone-ed286-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "capstone-ed286",
    storageBucket: "capstone-ed286.appspot.com",
    messagingSenderId: "561686103760",
    appId: "1:561686103760:web:da6460fcf592c8a7cd00d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Initialize the database

// Function to write user data
const registerButton = document.getElementById("registerButton"); // Use the button ID
registerButton.addEventListener("click", (e) => {
    const userId = push(child(ref(database), 'users/')).key;


    set(ref(database, "users/"+ userId), {
        firstName: document.querySelector("input[placeholder='First Name']").value,
        lastName: document.querySelector("input[placeholder='Last Name']").value,
        username: document.querySelector("input[placeholder='Username']").value,
        email: document.querySelector("input[placeholder='Email']").value,
        password: document.querySelector("input[placeholder='Password']").value,  // Storing passwords in plaintext is not recommended; consider using Firebase Authentication
        contactNumber: document.querySelector("input[placeholder='Contact Number']").value,
        company: document.querySelector("input[placeholder='Company']").value,
        department: document.querySelector("input[placeholder='Department']").value,
        position: document.querySelector("input[placeholder='Position']").value,
        birthday: document.querySelector("input[placeholder='Birthday']").value
    })
        .then(() => {
            console.log("User data saved successfully with ID: " + userId);
        })
        .catch((error) => {
            console.error("Error writing user data: ", error);
        });

    });
