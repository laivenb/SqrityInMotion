import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, update, ref, get, query, orderByChild, equalTo, remove } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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

// Function to fetch users with a "pending" status and populate the table
export const fetchPendingUsers = async () => {
    const dbRef = ref(database, 'users');
    const pendingQuery = query(dbRef, orderByChild("status"), equalTo("accepted")); // Query for users with "pending" status
    try {
        const snapshot = await get(pendingQuery);
        if (snapshot.exists()) {
            const tableBody = document.querySelector("#userRecordsTable tbody");
            tableBody.innerHTML = ""; // Clear the table before adding new data

            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                const userID = childSnapshot.key; // Get UID from childSnapshot.key

                // Create table row with user data
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${userID}</td> <!-- Display UID here -->
                    <td>${user.lastName}</td>
                    <td>${user.firstName}</td>
                    <td>${user.middleName || ""}</td>
                    <td>${user.email}</td>
                    <td>${user.department}</td>
                    <td>${user.position}</td>
                    <td>${user.requestDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);

                // Add delete button functionality
                row.querySelector(".delete-btn").addEventListener("click", () => deleteUser(userID));
            });

        } else {
            console.error("No pending user requests available");
        }
    } catch (error) {
        console.error("Error fetching pending user data:", error.message);
    }
};

// Function to handle user request actions (Allow/Deny)
async function handleUserRequest(button, status) {
    const row = button.closest("tr");
    const email = row.querySelector("td:nth-child(4)").textContent; // Retrieve user's email from row

    // Assuming there’s a function to update the user's status in Firebase
    try {
        await updateUserStatus(email, status);
        row.remove(); // Remove the row from the table
        showConfirmationModal(status); // Display action confirmation
    } catch (error) {
        console.error("Error updating user request:", error.message);
    }
}

// Function to find UID by email
async function getUidByEmail(email) {
    const usersRef = ref(database, 'users');
    const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));

    try {
        const snapshot = await get(emailQuery);
        if (snapshot.exists()) {
            let uid = null;
            snapshot.forEach((childSnapshot) => {
                uid = childSnapshot.key; // Retrieve the UID from the key
            });
            return uid;
        } else {
            console.log("No user found with the specified email.");
            return null;
        }
    } catch (error) {
        console.error("Error finding UID by email:", error);
        return null;
    }
}

// Function to update the user's status in Firebase
async function updateUserStatus(email, status) {
    const userUid = await getUidByEmail(email);

    if (userUid) {
        const userRef = ref(database, `users/${userUid}`);
        try {
            // Update only the 'status' field in the user's data
            await update(userRef, { status: status });
            console.log(`Status updated to ${status} for user with UID: ${userUid}`);
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    } else {
        console.log("Cannot update status - UID not found.");
    }
}

// Function to delete the user from the database
async function deleteUser(userID) {
    const userRef = ref(database, `users/${userID}`);
    try {
        // Remove the user from the database
        await remove(userRef);
        console.log(`User with UID ${userID} has been deleted.`);
        fetchPendingUsers(); // Refresh the table after deletion
    } catch (error) {
        console.error("Error deleting user:", error.message);
    }
}

// Function to display confirmation modal with dynamic message
function showConfirmationModal(status) {
    const message = `User request has been successfully ${status}.`;
    document.getElementById("confirmationMessage").textContent = message;
    $('#actionConfirmationModal').modal('show');
}

// Fetch pending users and populate the table on page load
document.addEventListener("DOMContentLoaded", fetchPendingUsers);
