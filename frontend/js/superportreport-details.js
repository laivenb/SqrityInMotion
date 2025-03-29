// Import Firebase modules
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
const userID = sessionStorage.getItem("uid");

if (!currentUser || !userID) {
    window.location.href = "login.html";
} else {
    // Retrieve reportID from URL and load details
    const reportID = getQueryParam('reportID');
    if (reportID) {
        loadReportDetails(reportID);
    } else {
        console.error("No report ID provided in the URL.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const exportPDFBtn = document.getElementById('exportPDFBtn');

    exportPDFBtn.addEventListener('click', function() {
        window.print();
    });
});

document.getElementById("backButton")?.addEventListener("click", () => {
    window.location.href = "superport-reports.html";
});

// Function to load the port report details
// Function to load the port report details
async function loadReportDetails(reportID) {
    try {
        const reportRef = ref(database, `portReports/${reportID}`);
        const snapshot = await get(reportRef);

        if (snapshot.exists()) {
            const reportData = snapshot.val();

            // -- Fill the header fields --
            const reportNameElem = document.getElementById("reportName");
            const createdByElem  = document.getElementById("createdBy");

            // Format the date to display only the date portion
            const formattedDate = reportData.dateCreated
                ? new Date(reportData.dateCreated).toLocaleDateString()
                : "N/A";
            // Set the title as desired: "Test Port Scan Report for 192.168.68.60, <date submitted>"
            if (reportNameElem) {
                reportNameElem.textContent = `Test Port Scan Report for 192.168.68.60, ${formattedDate}`;
            }

            const userID = reportData.userID; // e.g. "-OArWxDOvU0yVBf8ocHB"
            if (!userID) {
                if (createdByElem) {
                    createdByElem.textContent = "Created by: Unknown User";
                }
                return;
            }

            // Fetch user details from "users/<userID>"
            const userRef = ref(database, `users/${userID}`);
            const userSnap = await get(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.val();
                const userName = userData.username || userID;
                if (createdByElem) {
                    createdByElem.textContent = `Created by: ${userName}`;
                }
            } else {
                if (createdByElem) {
                    createdByElem.textContent = `Created by: ${userID}`;
                }
            }

            // Populate port details
            populatePortDetails(reportData.ports || []);
        } else {
            console.error("No such report found in Firebase.");
            document.getElementById('reportName').textContent = "Report Not Found";
        }
    } catch (error) {
        console.error("Error loading report details:", error);
    }
}


// Function to populate port details in the table
function populatePortDetails(ports) {
    const tableBody = document.querySelector("#portDetailsTable tbody");
    tableBody.innerHTML = ""; // Clear existing data

    let openPortsCount = 0;

    if (Array.isArray(ports) && ports.length > 0) {
        ports.forEach(port => {
            const row = document.createElement("tr");
            const stateColor = port.state === "open" ? "#348ae6" : "green";
            const stateLabel = `<span style="color: ${stateColor}; font-weight: bold;">${port.state || "N/A"}</span>`;

            if (port.state === "open") {
                openPortsCount++;
            }

            row.innerHTML = `
                <td>${port.port || "N/A"}</td>
                <td>${stateLabel}</td>
                <td>${port.service || "N/A"}</td>
                <td>${port.version || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4" class="text-center">No port data available</td>`;
        tableBody.appendChild(row);
    }

    document.getElementById('openPortsCount').textContent = openPortsCount;
}

// Function to retrieve query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Back button function
document.getElementById('backButton')?.addEventListener('click', () => {
    window.location.href = 'superport-reports.html';
});