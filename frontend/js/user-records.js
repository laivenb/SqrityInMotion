import { getDatabase, ref, update, get, query, orderByChild, equalTo, remove } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";

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

const roleMapping = {
    "Admin": 0,
    "Vulnerability Analyst": 1,
    "Supervisor": 2
};

// Function to fetch pending users and populate the table
export const fetchPendingUsers = async () => {
    const dbRef = ref(database, 'users');
    const pendingQuery = query(dbRef, orderByChild("status"), equalTo("accepted"));
    try {
        const snapshot = await get(pendingQuery);
        if (snapshot.exists()) {
            const tableBody = document.querySelector("#userRecordsTable tbody");
            tableBody.innerHTML = "";

            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                const userID = childSnapshot.key;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${userID}</td>
                    <td>${user.lastName}</td>
                    <td>${user.firstName}</td>
                    <td>${user.middleName || ""}</td>
                    <td>${user.email}</td>
                    <td>${user.department}</td>
                    <td class="position-cell">${user.position}</td>
                    <td>${user.requestDate}</td>
                    <td><button class="btn btn-danger btn-sm delete-btn">Delete</button></td>
                    <td><button class="btn btn-primary btn-sm edit-role-btn">Edit</button></td>
                        <td><button class="btn btn-secondary btn-sm reset-password-btn">Reset</button></td>

                `;
                tableBody.appendChild(row);



                // Add delete functionality
                row.querySelector(".delete-btn").addEventListener("click", () => deleteUser(userID));

                // Add edit functionality
                row.querySelector(".edit-role-btn").addEventListener("click", () => showRoleDropdown(row, userID));
            });
        } else {
            console.error("No pending user requests available");
        }
    } catch (error) {
        console.error("Error fetching pending user data:", error.message);
    }
};

// Function to show dropdown for role selection
// Function to show dropdown for role selection
function showRoleDropdown(row, userID) {
    const positionCell = row.querySelector(".position-cell");
    const currentPosition = positionCell.textContent.trim();
    const editButton = row.querySelector(".edit-role-btn");

    // Disable edit button, change text to "Cancel", and gray it out
    editButton.textContent = "Cancel";
    editButton.classList.remove("btn-primary");
    editButton.classList.add("btn-secondary");

    // Create dropdown + Save button
    positionCell.innerHTML = `
        <select class="form-control role-dropdown">
            <option value="Vulnerability Analyst" ${currentPosition === "Vulnerability Analyst" ? "selected" : ""}>Vulnerability Analyst</option>
            <option value="Supervisor" ${currentPosition === "Supervisor" ? "selected" : ""}>Supervisor</option>
            <option value="Admin" ${currentPosition === "Admin" ? "selected" : ""}>Admin</option>
        </select>
        <button class="btn btn-success btn-sm confirm-role-btn">Save</button>
    `;

    // Handle Save button
    positionCell.querySelector(".confirm-role-btn").addEventListener("click", () => {
        const newRole = positionCell.querySelector(".role-dropdown").value;
        updateUserRole(userID, newRole, positionCell, editButton);
    });

    // Handle Cancel button functionality
    editButton.addEventListener("click", () => {
        positionCell.innerHTML = currentPosition;
        editButton.textContent = "Edit";
        editButton.classList.remove("btn-secondary");
        editButton.classList.add("btn-primary");
    }, { once: true }); // Ensures event fires only once
}

// Function to update user role in Firebase
async function updateUserRole(userID, newRoleText, positionCell, editButton) {
    const newRoleValue = roleMapping[newRoleText];

    if (newRoleValue === undefined) {
        console.error(`Invalid role: ${newRoleText}`);
        return;
    }

    const userRef = ref(database, `users/${userID}`);
    try {
        await update(userRef, { position: newRoleText, role: newRoleValue });

        // Update UI: revert to original text and restore button
        positionCell.innerHTML = newRoleText;
        editButton.textContent = "Edit";
        editButton.classList.remove("btn-secondary");
        editButton.classList.add("btn-primary");

        console.log(`User role updated to ${newRoleText} (${newRoleValue}) for user with UID: ${userID}`);
    } catch (error) {
        console.error("Error updating user role:", error);
    }
}

// Function to delete user
async function deleteUser(userID) {
    const userRef = ref(database, `users/${userID}`);
    try {
        await remove(userRef);
        console.log(`User with UID ${userID} has been deleted.`);
        fetchPendingUsers();
    } catch (error) {
        console.error("Error deleting user:", error.message);
    }
}

// Fetch users on page load
document.addEventListener("DOMContentLoaded", fetchPendingUsers);
