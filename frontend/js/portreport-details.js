// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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
    // Load the report details for the current user
    loadReportDetails(userID);
}

// Function to load the report details for a specific user
async function loadReportDetails(userID) {
    try {
        // Retrieve the reportID from the URL
        const reportID = getQueryParam('reportID');

        if (!reportID) {
            console.error("No report ID provided in the URL.");
            return;
        }

        // Access the specific report for the user by reportID in portReports
        const reportRef = ref(database, `portReports/${reportID}`);

        const snapshot = await get(reportRef);
        if (snapshot.exists()) {
            const reportData = snapshot.val();
            if (reportData && reportData.userID === userID) {  // Ensure report belongs to the user
                document.getElementById('reportTitle').textContent = reportData.title || "Untitled Report";
                document.getElementById('reportDate').textContent = `Date Created: ${reportData.dateCreated || "N/A"}`;

                // Populate other report details here, such as port data
                populatePortDetails(reportData.ports || []);
            } else {
                document.getElementById('reportTitle').textContent = "Report Not Found";
                document.getElementById('reportDate').textContent = "";
            }
        } else {
            console.error("No such report found in Firebase.");
            document.getElementById('reportTitle').textContent = "Report Not Found";
            document.getElementById('reportDate').textContent = "";
        }
    } catch (error) {
        console.error("Error loading report details:", error);
    }
}

// Helper function to populate port details in the table
function populatePortDetails(ports) {
    const tableBody = document.querySelector("#portDetailsTable tbody");
    tableBody.innerHTML = ""; // Clear existing data

    ports.forEach(port => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${port.port}</td>
            <td>${port.state}</td>
            <td>${port.service}</td>
            <td>${port.version}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to retrieve query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Back button function
export function goBack() {
    window.location.href = 'port-reports.html';
}

document.getElementById('backButton').addEventListener('click', goBack);