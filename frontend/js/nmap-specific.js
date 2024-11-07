const BASE_URL = 'http://192.168.1.105:5000';
let openPorts = [];  // This will store all the ports info
let ipAddress;
let currentUserID;  // Variable to store current user's ID

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

    if (!currentUserID) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
        return;
    } else {
        console.log("Logged in as:", currentUserID);
    }

    // Event listener for the 'viewResultsButton' button to navigate to the home page
    document.getElementById('viewResultsButton').addEventListener('click', navigateToHome);

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
            })
            .catch(error => console.error('Error:', error));
    } else {
        document.querySelector('h2').textContent = "Unknown IP";
    }
}

// Function to upload the open ports data to Firebase when the "Save" button is clicked
function uploadPortsToFirebase() {
    const database = getDatabase(); // Firebase database reference
    const userID = currentUserID;  // Get the current user's ID (Foreign Key)
    const dateCreated = new Date().toISOString();  // Current date and time
    const reportName = `Port Scan Report for ${ipAddress}`; // Report name

    // Reference to the portReports node in Firebase
    const portReportsRef = ref(database, "portReports");

    // Generate a new unique key for the port report
    const newPortReportRef = push(portReportsRef);

    // Set the data for the new port report in Firebase
    set(newPortReportRef, {
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
