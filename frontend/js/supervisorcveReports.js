// Import Firebase and required database functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get
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
    // Get supervisor ID from session storage
    const supervisorID = sessionStorage.getItem("uid");

    if (!supervisorID) {
        // Redirect to login if no supervisor is logged in
        window.location.href = "login.html";
    } else {
        // Load reports assigned to this supervisor
        loadSupervisorReports(supervisorID);
    }

    // Event delegation for dynamically loaded buttons
    $('#reportsTable').on('click', '.view-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        window.location.href = `supercvereport-details.html?reportID=${reportID}`;
    });

    $('#reportsTable').on('click', '.export-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        exportReportAsJSON(reportID);
    });
});

// Function to load reports assigned to the logged-in supervisor
async function loadSupervisorReports(supervisorID) {
    const tableBody = $('#reportsTable tbody');
    tableBody.empty(); // Clear any existing data

    try {
        // Reference to supervisor's assigned reports
        const reportsRef = ref(database, `supervisorcveReports/${supervisorID}`);
        const snapshot = await get(reportsRef);

        if (!snapshot.exists()) {
            tableBody.append('<tr><td colspan="4">No Reports Assigned</td></tr>');
            return;
        }

        // Convert snapshot to an array of promises
        const reportPromises = Object.values(snapshot.val()).map(async (data) => {
            const reportID = data.reportID;
            const dateSubmitted = new Date(data.dateSubmitted).toLocaleString();
            const userID = data.submittedBy; // This is currently the userID

            // Fetch the username using the userID
            const username = await getUsername(userID);

            return `
                <tr>
                    <td>${reportID}</td>
                    <td>${dateSubmitted}</td>
                    <td>${username}</td>
                    <td class="button-container">
                        <button class="btn view-btn">View Report</button>
                        <button class="btn export-btn">Export as JSON</button>
                    </td>
                </tr>
            `;
        });

        // Wait for all reports to be processed
        const reportRows = await Promise.all(reportPromises);
        tableBody.append(reportRows.join(''));

        // Initialize DataTable
        initializeDataTable();

    } catch (error) {
        console.error("Error loading reports:", error);
        tableBody.append('<tr><td colspan="4">Error loading reports. Please try again.</td></tr>');
    }
}

// Function to fetch username from Firebase using userID
async function getUsername(userID) {
    try {
        const userRef = ref(database, `users/${userID}/username`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            return snapshot.val(); // Return username
        } else {
            return "Unknown User"; // If username is not found
        }
    } catch (error) {
        console.error("Error fetching username:", error);
        return "Error Fetching User";
    }
}

// Function to initialize DataTable
function initializeDataTable() {
    if ($.fn.DataTable.isDataTable('#reportsTable')) {
        $('#reportsTable').DataTable().clear().destroy();
    }
    $('#reportsTable').DataTable({
        dom: 't',       // Only table, no controls
        paging: false,  // No pagination
        info: false,    // No "Showing X to Y of Z"
        searching: false, // No search bar
    });
}

// Function to export the report as JSON
async function exportReportAsJSON(reportID) {
    try {
        const reportRef = ref(database, `cveReports/${reportID}`);
        const snapshot = await get(reportRef);

        if (snapshot.exists()) {
            const reportData = snapshot.val();

            // Convert data to JSON and download
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `report_${reportID}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
        } else {
            console.error("Report not found!");
            alert("Report not found.");
        }

    } catch (error) {
        console.error("Error exporting report:", error);
        alert("Failed to export report. Please try again.");
    }
}
