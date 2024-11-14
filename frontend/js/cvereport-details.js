import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, set, push, child, get, query, orderByChild, orderByKey, equalTo, limitToLast } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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
    // Redirect to login page if no user is logged in
    window.location.href = "login.html";
} else {
    // Load the CVE report details for the current user
    loadReportDetails(userID);
    const vulnerabilitiesData = JSON.parse(sessionStorage.getItem("vulnerabilitiesData"));

    console.log("Vulnerabilities data saved to sessionStorage:", vulnerabilitiesData);
}

// Function to load the CVE report details for a specific user
async function loadReportDetails(userID) {
    try {
        // Retrieve the reportID from the URL
        const reportID = getQueryParam('reportID');
        console.log(reportID);

        if (!reportID) {
            console.error("No report ID provided in the URL.");
            return;
        }

        $('#saveButton').hide();

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
                <td>${port.version || "N/A"}</td>
                <td>${port.cve_id || "N/A"}</td>
                <td>${port.cve_score || "N/A"}</td>
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

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Function to upload the open ports data to Firebase when the "Save" button is clicked
async function uploadPortsToFirebase() {
    console.log("uploading to firebase");
    const vulnerabilitiesData = JSON.parse(sessionStorage.getItem("vulnerabilitiesData")); // Fetch the vulnerabilities data from sessionStorage
    const userID = sessionStorage.getItem("uid");  // Get the current user's ID (Foreign Key)
    const dateCreated = getCurrentDate();  // Current date and time
    const reportName = `Test Port CVE Report for `; // Report name

    // Generate a custom port ID for the new port report
    const reportID = await generateCustomPortId();

    // Reference to the specific port report using the custom reportID
    const portReportRef = ref(database, `cveReports/${reportID}`);

    // Use vulnerabilitiesData as the ports array
    const ports = vulnerabilitiesData.map(vulnerability => ({
        port: vulnerability.port,
        state: vulnerability.state,
        version: vulnerability.version,
        cve_id: vulnerability.cve_id,
        cve_score: vulnerability.cve_score
    }));

    // Set the data for the new port report in Firebase
    set(portReportRef, {
        userID: userID,  // Foreign Key: User ID
        reportName: reportName,
        ports: ports,  // Array of open ports from vulnerabilitiesData
        dateCreated: dateCreated
    })
        .then(() => {
            console.log("Port Report uploaded successfully!");
            alert("Report saved successfully!");
        })
        .catch((error) => {
            console.error("Error uploading port report:", error);
        });
}


async function generateCustomPortId() {
    // Prefix is now set to '02'
    const prefix = '03';

    // Query to find the last port report ID in the portReports node
    const portReportQuery = query(ref(database, "cveReports"), orderByKey(), limitToLast(1));
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


// Event listener for the 'Save' button to save the report
document.getElementById('saveButton').addEventListener('click', uploadPortsToFirebase);

const isHome = JSON.parse(sessionStorage.getItem("isHome"));  // Converts "true" back to true
const uid = sessionStorage.getItem("uid");

console.log("Is Home:", isHome);


if (isHome) {

    console.log("isHome parameter is true.");

    const vulnerabilitiesData = JSON.parse(sessionStorage.getItem("vulnerabilitiesData"));
    const tableBody = $('#cveDetailsTable tbody');
    tableBody.empty();  // Clear the existing data

    if (Array.isArray(vulnerabilitiesData) && vulnerabilitiesData.length > 0) {
        vulnerabilitiesData.forEach(vulnerability => {
            const row = `
                    <tr>
                        <td>${vulnerability.port || 'N/A'}</td>
                        <td>${vulnerability.state || 'N/A'}</td>
                        <td>${vulnerability.version || 'N/A'}</td>
                        <td>${vulnerability.cve_id || 'N/A'}</td>
                        <td>${vulnerability.cve_score || 'N/A'}</td>
                    </tr>
                `;
            tableBody.append(row);
        });
    } else {
        const row = `
                <tr>
                    <td colspan="5" class="text-center">No CVE data available</td>
                </tr>
            `;
        tableBody.append(row);
    }

    // Initialize or reinitialize DataTable
    $('#cveDetailsTable').DataTable();

    sessionStorage.setItem("isHome", false);
} else {
    console.log("isHome parameter is not true.");
    loadReportDetails(uid);
}


