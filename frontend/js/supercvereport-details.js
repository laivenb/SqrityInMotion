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
            document.getElementById('reportName').textContent = reportData.reportName || "Untitled Report";
            document.getElementById('dateCreated').textContent = `Date Created: ${reportData.dateCreated || "N/A"}`;

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
    tableBody.innerHTML = "";
    let openPortsCount = 0;
    let criticalPortsCount = 0;

    if (Array.isArray(ports) && ports.length > 0) {
        ports.forEach(port => {
            const row = document.createElement("tr");
            const stateColor = port.state === "open" ? "#348ae6" : "green";
            const stateLabel = `<span style="color: ${stateColor}; font-weight: bold;">${port.state || "N/A"}</span>`;
            if (port.state === "open") openPortsCount++;
            const cveScore = parseFloat(port.cve_score) || 0;
            let scoreBackgroundColor = "#d4edda";
            if (cveScore >= 7.0) {
                scoreBackgroundColor = "#f8d7da";
                criticalPortsCount++;
            } else if (cveScore >= 4.0) {
                scoreBackgroundColor = "#fff3cd";
            }
            row.innerHTML = `
                <td>${port.port || "N/A"}</td>
                <td>${stateLabel}</td>
                <td>${port.version || "N/A"}</td>
                <td>${port.cve_id || "N/A"}</td>
                <td style="background-color: ${scoreBackgroundColor}; font-weight: bold; text-align: center;">
                    ${port.cve_score || "N/A"}
                </td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" class="text-center">No CVE data available</td>`;
        tableBody.appendChild(row);
    }
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