// Import Firebase and the required Firebase Database functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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
    // Check if the user is logged in
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
        exportReportAsJSON(reportID);
    });
});

// Function to load reports for the current user from Firebase Realtime Database
async function loadReports(userID) {
    const tableBody = $('#reportsTable tbody');
    tableBody.empty(); // Clear any existing data

    try {
        // Reference to the Firebase Realtime Database
        const db = getDatabase();
        const reportsRef = ref(db, "portReports"); // Assuming reports are stored under "portReports"

        // Query reports based on userID
        const snapshot = await get(reportsRef);

        let reportsFound = false;

        if (!snapshot.exists()) {
            // If no reports exist in the database, show "No Report Found"
            tableBody.append('<tr><td colspan="4">No Report Found</td></tr>');
        } else {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();

                // Filter reports by userID
                if (data.userID === userID) {
                    const newRow = `
                        <tr>
                            <td>${childSnapshot.key}</td>
                            <td>${data.reportName || "Unnamed Report"}</td>
                            <td>${data.dateCreated ? new Date(data.date).toLocaleString() : "N/A"}</td>
                            <td>
                                <button class="btn btn-primary view-btn">View Report</button>
                                <button class="btn btn-secondary export-btn">Export as JSON</button>
                            </td>
                        </tr>
                    `;
                    tableBody.append(newRow);
                    reportsFound = true;
                }
            });

            // If no reports for the user were found, show "No Report Found"
            if (!reportsFound) {
                tableBody.append('<tr><td colspan="4">No Report Found</td></tr>');
            }
        }

        // Only initialize DataTable if there's data to display (reportsFound is true)
        if (reportsFound) {
            initializeDataTable();
        }

    } catch (error) {
        console.error("Error loading reports from Firebase:", error);
        tableBody.append('<tr><td colspan="4">Error loading reports. Please try again.</td></tr>');
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
        "pageLength": 10,
        "lengthMenu": [5, 10, 25, 50],
        "ordering": true,
        "searching": true,
        "responsive": true
    });
}

// Function to export the report as JSON
function exportReportAsJSON(reportID) {
    // Reference to the Firebase Realtime Database
    const db = getDatabase();
    const reportRef = ref(db, `portReports/${reportID}`);

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
            alert("Report not found.");
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
    });
}
