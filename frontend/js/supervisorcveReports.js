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
    console.log("Supervisor ID:", supervisorID);

    if (!supervisorID) {
        console.warn("No supervisor ID found. Redirecting to login.");
        window.location.href = "login.html";
    } else {
        console.log("Loading reports for supervisor:", supervisorID);
        loadSupervisorReports(supervisorID);
    }

    // Event delegation for dynamically loaded buttons
    $('#reportsTable').on('click', '.view-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        console.log("Viewing report:", reportID);
        window.location.href = `supercvereport-details.html?reportID=${reportID}`;
    });

    $('#reportsTable').on('click', '.export-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        console.log("Exporting report:", reportID);
        exportReportAsJSON(reportID);
    });
});

// Function to load reports assigned to the logged-in supervisor
// Function to load reports assigned to the logged-in supervisor
async function loadSupervisorReports(supervisorID) {
    const tableBody = $('#reportsTable tbody');
    tableBody.empty(); // Clear any existing data

    try {
        // Reference to supervisor's assigned reports
        const reportsRef = ref(database, `supervisorcveReports/${supervisorID}`);
        const snapshot = await get(reportsRef);
        console.log("Retrieved reports snapshot:", snapshot.val());

        if (!snapshot.exists()) {
            console.warn("No reports assigned to this supervisor.");
            tableBody.append('<tr><td colspan="4">No Reports Assigned</td></tr>');
            return;
        }

        // Convert snapshot to an array of promises
        const reportPromises = Object.values(snapshot.val()).map(async (data) => {
            console.log("Processing report:", data);
            if (!data.reportID || !data.dateSubmitted || !data.submittedBy) {
                console.warn("Invalid report data:", data);
                return null;
            }

            const reportID = data.reportID;
            // Format dateSubmitted to show only the date without the time
            const dateSubmitted = new Date(data.dateSubmitted).toLocaleDateString();
            const userID = data.submittedBy; // This is currently the userID

            // Fetch the username using the userID
            const username = await getUsername(userID);
            console.log(`Fetched username for userID ${userID}:`, username);

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
        const reportRows = (await Promise.all(reportPromises)).filter(row => row !== null);
        if (reportRows.length === 0) {
            tableBody.append('<tr><td colspan="4">No valid reports found.</td></tr>');
        } else {
            tableBody.append(reportRows.join(''));
            console.log("Reports loaded into table.");
        }

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
        console.log(`Fetching username for userID: ${userID}`);
        const userRef = ref(database, `users/${userID}/username`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            console.log(`Username found: ${snapshot.val()}`);
            return snapshot.val();
        } else {
            console.warn(`Username not found for userID: ${userID}`);
            return "Unknown User";
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
        console.log(`Exporting report ${reportID} as JSON`);
        const reportRef = ref(database, `cveReports/${reportID}`);
        const snapshot = await get(reportRef);

        if (snapshot.exists()) {
            const reportData = snapshot.val();
            console.log("Report data:", reportData);

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
