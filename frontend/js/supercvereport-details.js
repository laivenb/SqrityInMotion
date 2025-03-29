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

// Retrieve reportID from URL
const reportID = getQueryParam('reportID');
if (reportID) {
    loadReportDetails(reportID);
} else {
    console.error("No report ID provided in the URL.");
}

document.addEventListener('DOMContentLoaded', function() {
    const exportPDFBtn = document.getElementById('exportPDFBtn');

    exportPDFBtn.addEventListener('click', function() {
        window.print();
    });
});


// Function to load the CVE report details using reportID
async function loadReportDetails(reportID) {
    try {
        const reportRef = ref(database, `cveReports/${reportID}`);
        const snapshot = await get(reportRef);

        if (snapshot.exists()) {
            const reportData = snapshot.val();
            // Format the date to display only the date portion
            const formattedDate = reportData.dateCreated
                ? new Date(reportData.dateCreated).toLocaleDateString()
                : "N/A";
            // Hardcode IP to 192.168.64.63 and use the formatted date for the title
            document.getElementById('reportName').textContent = `CVE report for 192.168.64.63, ${formattedDate}`;

            const userID = reportData.userID;
            if (userID) {
                // Fetch the username from users/<userID>
                const userRef = ref(database, `users/${userID}`);
                const userSnap = await get(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.val();
                    const userName = userData.username || userID; // fallback to userID if username not found
                    document.getElementById('createdBy').textContent = `Created by: ${userName}`;
                } else {
                    document.getElementById('createdBy').textContent = `Created by: ${userID}`;
                }
            } else {
                document.getElementById('createdBy').textContent = "Created by: Unknown User";
            }
            // Populate CVE details in the table
            populateCveDetails(reportData.ports || []);
        } else {
            console.error("No such report found in Firebase.");
            document.getElementById('reportName').textContent = "Report Not Found";
            document.getElementById('dateCreated').textContent = "";
        }
    } catch (error) {
        console.error("Error loading report details:", error);
    }
}

// Function to populate CVE details in the table
function populateCveDetails(ports) {
    const tableBody = document.querySelector("#cveDetailsTable tbody");
    tableBody.innerHTML = ""; // Clear existing data

    let openPortsCount = 0;
    let criticalPortsCount = 0;

    if (Array.isArray(ports) && ports.length > 0) {
        ports.forEach(port => {
            const row = document.createElement("tr");

            // Determine color for port state (open/closed)
            const stateColor = port.state === "open" ? "#348ae6" : "green";
            const stateLabel = `<span style="color: ${stateColor}; font-weight: bold;">${port.state || "N/A"}</span>`;

            // Count open ports
            if (port.state === "open") {
                openPortsCount++;
            }

            let scoreBackgroundColor;
            let displayCveScore = port.cve_score;

            // If the CVE score is "N/A" or not a valid number, set a white background.
            if (port.cve_score === "N/A" || isNaN(parseFloat(port.cve_score))) {
                scoreBackgroundColor = "#ffffff";
                displayCveScore = "N/A";
            } else {
                const cveScore = parseFloat(port.cve_score);
                if (cveScore >= 9.0) {
                    scoreBackgroundColor = "#dc3545"; // Critical => bright red
                    criticalPortsCount++;
                } else if (cveScore >= 7.0) {
                    scoreBackgroundColor = "#fd7e14"; // High => orange
                } else if (cveScore >= 4.0) {
                    scoreBackgroundColor = "#ffc107"; // Medium => yellow
                } else {
                    scoreBackgroundColor = "#28a745"; // Low => green
                }
            }

            // Add row with colored cells
            row.innerHTML = `
                <td>${port.port || "N/A"}</td>
                <td>${stateLabel}</td>
                <td>${port.version || "N/A"}</td>
                <td>${port.cve_id || "N/A"}</td>
                <td style="background-color: ${scoreBackgroundColor}; font-weight: bold; text-align: center;">
                    ${displayCveScore}
                </td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" class="text-center">No CVE data available</td>`;
        tableBody.appendChild(row);
    }

    // Update counts in the UI (these should exist in your HTML)
    document.getElementById('openPortsCount').textContent = openPortsCount;
    document.getElementById('criticalPortsCount').textContent = criticalPortsCount;
}


// Function to retrieve query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Back button function
document.getElementById('backButton')?.addEventListener('click', () => {
    window.location.href = 'supercve-reports.html';
});