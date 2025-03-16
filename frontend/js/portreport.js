// Import Firebase and the required Firebase Database functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    query,
    orderByKey, limitToLast
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

$(document).ready(function () {

    const currentUser = sessionStorage.getItem("username");
    const userID = sessionStorage.getItem("uid");

    if (!currentUser || !userID) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
    } else {
        // Load reports using userID from session storage
        loadReports(userID);
    }

    // Event delegation for dynamically loaded content
    $('#reportsTable').on('click', '.view-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        window.location.href = `portreport-details.html?reportID=${reportID}`;
    });

    $('#reportsTable').on('click', '.export-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        exportReportAsJSON(userID, reportID);
    });
    $('#reportsTable').on('click', '.send-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        const userID = sessionStorage.getItem("uid"); // Get logged-in user ID

        if (showConfirmModal("Are you sure you want to send this report to the supervisor?"), 'function', reportID) {
        }

    });
});

// Function to load reports for the current user from Firebase Realtime Database
async function loadReports(userID) {
    const tableBody = $('#reportsTable tbody');
    tableBody.empty(); // Clear any existing data

    try {
        // Reference to the Firebase Realtime Database
        const db = getDatabase();
        const reportsRef = ref(db, "portReports"); // Assuming reports are stored under "cveReports"

        // Query reports based on userID
        const snapshot = await get(reportsRef);

        let reportsFound = false;

        if (!snapshot.exists()) {
            tableBody.append('<tr><td colspan="5">No Report Found</td></tr>');
        } else {
            const reportRows = []; // Store rows temporarily for performance optimization
            const userCache = {}; // Cache to avoid duplicate queries for usernames

            // Process each report
            for (const childKey in snapshot.val()) {
                const data = snapshot.val()[childKey];
                const reportUserID = data.userID;

                // Skip reports that do not belong to the current user
                if (reportUserID !== userID) continue;

                // Get username (either from cache or Firebase)
                let username = userCache[reportUserID] || await getUsernameFromUserID(reportUserID);
                userCache[reportUserID] = username; // Cache the retrieved username

                // Append the report row
                const newRow = `
                    <tr>
                        <td>${childKey}</td>
                        <td>${data.reportName || "Unnamed Report"}</td>
                        <td>${data.dateCreated ? new Date(data.dateCreated).toLocaleString() : "N/A"}</td>
                        <td>${username}</td> 
                        <td class="button-container">
    <button class="btn view-btn">View Report</button>
    <button class="btn export-btn">Export as JSON</button>
    <button class="btn send-btn">Send to Supervisor</button>
</td>
                    </tr>
                `;
                reportRows.push(newRow);
                reportsFound = true;
            }

            // Append all report rows at once (better performance)
            tableBody.append(reportRows.join(""));

            if (!reportsFound) {
                tableBody.append('<tr><td colspan="5">No Report Found</td></tr>');
            }
        }

        if (reportsFound) {
            initializeDataTable();
        }

    } catch (error) {
        console.error("Error loading reports from Firebase:", error);
        tableBody.append('<tr><td colspan="5">Error loading reports. Please try again.</td></tr>');
    }
}

// Function to initialize DataTable
function initializeDataTable() {
    // Ensure DataTable is only initialized once
    if ($.fn.DataTable.isDataTable('#reportsTable')) {
        $('#reportsTable').DataTable().clear().destroy(); // Clear any previous DataTable instance
    }

    // Initialize DataTable
    $('#reportsTable').DataTable({
        dom: 't',       // Only table, no controls
        paging: false,  // No pagination
        info: false,    // No "Showing X to Y of Z"
        searching: false, // No search bar
    });
}

// Function to export the report as JSON
function exportReportAsJSON(userID, reportID) {
    // Reference to the Firebase Realtime Database
    const db = getDatabase();
    const reportRef = ref(db, `portReports/${reportID}`);


    updateAuditInFirebase(userID, reportID);

    get(reportRef).then((snapshot) => {
        if (snapshot.exists()) {
            const reportData = snapshot.val();

            // Convert report data to JSON and download as a file
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `report_${reportID}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
        } else {
            console.error("No such document!");
            showModal("Report successfully sent to all supervisors!");
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
    });
}

function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


async function updateAuditInFirebase(userID, reportID) {
    const timestamp = getCurrentDateTime();

    // Generate a custom port ID for the new port report
    const transactionID = await generateCustomPortId();

    // Reference to the specific port report using the custom reportID
    const portReportRef = ref(database, `portReports_audit/${transactionID}`);

    // Set the data for the new port report in Firebase
    set(portReportRef, {
        userID: userID,  // Foreign Key: User ID
        reportID: reportID,
        timestamp: timestamp,  // Array of open ports
        type: "export"
    })
        .then(() => {
            console.log("Port Report audited successfully!");
        })
        .catch((error) => {
            console.error("Error auditing port report:", error);
        });
}

async function sendToSupervisor(userID, reportID) {
    const db = getDatabase();

    try {
        // Get all users to find supervisors (role = 2)
        const usersRef = ref(db, "users");
        const usersSnapshot = await get(usersRef);

        if (!usersSnapshot.exists()) {
            showModal("No supervisors found.");
            return;
        }

        let supervisorsFound = false;
        const dateSubmitted = new Date().toISOString(); // Get current timestamp

        // Loop through users to find supervisors
        usersSnapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            if (userData.role === 2) { // Ensure it's a supervisor
                const supervisorID = childSnapshot.key; // Get supervisor UID

                // Reference for supervisorcveReports/{supervisorID}/{reportID}
                const supervisorRef = ref(db, `supervisorportReports/${supervisorID}/${reportID}`);

                // Store only reportID, dateSubmitted, and submittedBy
                set(supervisorRef, {
                    reportID: reportID,
                    dateSubmitted: dateSubmitted,
                    submittedBy: userID
                });

                supervisorsFound = true;
            }
        });

        if (supervisorsFound) {
            showModal("Report successfully sent to all supervisors!");
        } else {
            showModal("No supervisors found with role = 2.");
        }

    } catch (error) {
        console.error("Error sending report to supervisor:", error);
        showModal("Failed to send report. Please try again.");
    }
}

async function generateCustomPortId() {
    // Prefix is now set to '02'
    const prefix = '04';

    // Query to find the last port report ID in the portReports node
    const portReportQuery = query(ref(database, "portReports_audit"), orderByKey(), limitToLast(1));
    const snapshot = await get(portReportQuery);

    let increment = 1;  // Start from 1 if there are no previous records

    if (snapshot.exists()) {
        const lastPortReportId = Object.keys(snapshot.val())[0];
        const lastIncrement = lastPortReportId.split('_')[0].slice(-4);
        increment = parseInt(lastIncrement, 10) + 1;
    }

    const incrementedPart = String(increment).padStart(4, '0');
    const key = generateRandomKey();

    return `${prefix}${incrementedPart}_${key}`;
}

// Function to generate a random key (for security)
function generateRandomKey() {
    return Math.random().toString(36).substring(2, 15);
}

async function getUsernameFromUserID(userID) {
    const db = getDatabase();
    const userRef = ref(db, `users/${userID}/username`); // Adjust based on your database structure

    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return snapshot.val(); // Return the username
        } else {
            return "Unknown User"; // Default if username not found
        }
    } catch (error) {
        console.error("Error retrieving username:", error);
        return "Error Fetching User";
    }
}

// Show the modal with a custom message
function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
}

// Hide the modal
function hideModal() {
    document.getElementById('alertModal').style.display = 'none';
}

// Close (X) button event
document.getElementById('closeModalBtn').addEventListener('click', hideModal);

function showConfirmModal(message, onYes, reportID) {
    // Set the confirmation message
    document.getElementById('confirmMessage').textContent = message;
    // Show the modal
    document.getElementById('confirmModal').style.display = 'block';

    // Handle the "Yes" button
    const yesBtn = document.getElementById('confirmYesBtn');
    // Remove any previous event listeners to avoid duplication
    yesBtn.replaceWith(yesBtn.cloneNode(true));
    document.getElementById('confirmYesBtn').addEventListener('click', function() {
        hideConfirmModal();
        const userID = sessionStorage.getItem("uid");
        sendToSupervisor(userID, reportID);
        if (typeof onYes === 'function') onYes();
    });
}

function hideConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Close modal when clicking the "X" or "No" button
document.getElementById('closeConfirmBtn').addEventListener('click', hideConfirmModal);
document.getElementById('confirmNoBtn').addEventListener('click', hideConfirmModal);
