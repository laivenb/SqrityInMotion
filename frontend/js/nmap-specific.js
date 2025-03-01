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

const BASE_URL = 'http://192.168.1.63:5000';
let openPorts = [];  // This will store all the ports info
let ipAddress;
let currentUserID;
let currentUid;

// Function to get the current IP from URL
function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ip');
}

// Navigate to the home page and save open ports in local storage
function navigateToHome() {
    ipAddress = getIPFromURL();
    localStorage.setItem('openPorts', JSON.stringify(openPorts));
    window.location.href = `home.html?ip=${ipAddress}`;
}

// DOMContentLoaded event listener for session validation and setting up button click
document.addEventListener('DOMContentLoaded', function () {
    // Session check for current user
    currentUserID = sessionStorage.getItem("username");
    currentUid = sessionStorage.getItem("uid");

    if (!currentUserID) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
        return;
    } else {
        console.log("Logged in as:", currentUserID);
        console.log("UID set in sessionStorage:", currentUid);
    }

    // Event listener for the 'viewResultsButton' button to navigate to the home page
    document.getElementById('viewResultsButton').addEventListener('click', function() {

        // Set 'notFirstLogin' in sessionStorage when the button is clicked
        sessionStorage.setItem('firstLogin', 'false');

        navigateToHome();
    });
    // Event listener for the 'Save' button to save the report
    document.getElementById('saveButton').addEventListener('click', uploadPortsToFirebase);

    const resultsContainer = $('#scan-results').DataTable();

    // Call to update IP Address and scan results
    updateIPAddress(resultsContainer);
});

// Function to update IP address and fetch scan results
function updateIPAddress(resultsContainer) {
    ipAddress = getIPFromURL();

    console.log(ipAddress);

    if (ipAddress) {
        document.querySelector('h2').textContent = ipAddress;

        // Fetch scan data from the server for the device
        fetch(`${BASE_URL}/scan-device-version`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip: ipAddress })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                resultsContainer.clear();
                openPorts = [];

                if (data.output) {
                    const lines = data.output.trim().split('\n');
                    lines.forEach(line => {
                        const parts = line.split(/\s+/);
                        if (parts.length >= 4) {

                            const port = parts[0].replace('/tcp', '').trim();
                            const state = parts[1];
                            const service = parts[2].trim();
                            const version = parts.slice(3).join(' ').replace(/\s*\(.*?\)\s*/, '').trim();

                            if (state.toLowerCase() === 'open') {
                                openPorts.push({ port: port, state: state, service: service, version: version });
                            }

                            resultsContainer.row.add([port, state, service, version]);
                        }
                    });
                    resultsContainer.draw();
                } else {
                    resultsContainer.row.add(['', 'No results found or host is down.', '', '']).draw();
                }

                console.log("Open Ports:", openPorts);
                hideSpinner();
                alert("Scanning completed!");
            })
            .catch(error => console.error('Error:', error));
    } else {
        document.querySelector('h2').textContent = "Unknown IP";
    }
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Function to upload the open ports data to Firebase when the "Save" button is clicked
async function uploadPortsToFirebase() {
    const userID = currentUid;  // Get the current user's ID (Foreign Key)
    const dateCreated = getCurrentDate();  // Current date and time
    const reportName = `Test Port Scan Report for ${ipAddress}`; // Report name

    // Generate a custom port ID for the new port report
    const reportID = await generateCustomPortId();

    // Reference to the specific port report using the custom reportID
    const portReportRef = ref(database, `portReports/${reportID}`);

    // Set the data for the new port report in Firebase
    set(portReportRef, {
        userID: userID,  // Foreign Key: User ID
        reportName: reportName,
        ports: openPorts,  // Array of open ports
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
    const prefix = '02';

    // Query to find the last port report ID in the portReports node
    const portReportQuery = query(ref(database, "portReports"), orderByKey(), limitToLast(1));
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


