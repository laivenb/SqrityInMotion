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

// Check if the user is logged in
const currentUser = sessionStorage.getItem("username");
const userID = sessionStorage.getItem("userID");

if (!currentUser || !userID) {
    // Redirect to login page if no user is logged in
    window.location.href = "login.html";
} else {
    // Load the CVE report details for the current user
    loadReportDetails(userID);
}

// Function to load the CVE report details for a specific user
async function loadReportDetails(userID) {
    try {
        // Retrieve the reportID from the URL
        const reportID = getQueryParam('reportID');

        if (!reportID) {
            console.error("No report ID provided in the URL.");
            return;
        }

        // Access the specific report for the user by reportID in cveReports
        const reportRef = ref(database, `cveReports/${reportID}`);

        const snapshot = await get(reportRef);
        if (snapshot.exists()) {
            const reportData = snapshot.val();
            if (reportData && reportData.userID === userID) {
                document.getElementById('reportName').textContent = reportData.reportName || "Untitled Report";
                document.getElementById('dateCreated:').textContent = `Date Created: ${new Date(reportData.dateCreated).toLocaleString() || "N/A"}`;

                // Populate CVE details in the table
                populateCveDetails(reportData.ports || []);
            } else {
                document.getElementById('reportName').textContent = "Report Not Found";
                document.getElementById('dateCreated:').textContent = "";
            }
        } else {
            console.error("No such report found in Firebase.");
            document.getElementById('reportName').textContent = "Report Not Found";
            document.getElementById('dateCreated:').textContent = "";
        }
    } catch (error) {
        console.error("Error loading report details:", error);
    }
}

// Helper function to populate CVE details in the table
function populateCveDetails(ports) {
    const tableBody = document.querySelector("#cveDetailsTable tbody");
    tableBody.innerHTML = ""; // Clear existing data

    // Check if the ports array exists and has data
    if (Array.isArray(ports) && ports.length > 0) {
        ports.forEach(port => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${port.port || "N/A"}</td>
                <td>${port.state || "N/A"}</td>
                <td>${port.service || "N/A"}</td>
                <td>${port["CVE ID"] || "N/A"}</td>
                <td>${port["CVE Score"] || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="5" class="text-center">No CVE data available</td>
        `;
        tableBody.appendChild(row);
    }
}

// Function to retrieve query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Back button function
export function goBack() {
    window.location.href = 'cve-reports.html';
}

document.getElementById('backButton')?.addEventListener('click', goBack);  // Make sure the backButton exists
