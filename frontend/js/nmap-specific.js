const BASE_URL = 'http://192.168.254.127:5000';
let openPorts = [];
let ipAddress;

function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ip');
}

function navigateToHome() {
    ipAddress = getIPFromURL();
    localStorage.setItem('openPorts', JSON.stringify(openPorts));
    window.location.href = `home.html?ip=${ipAddress}`;
}

document.addEventListener('DOMContentLoaded', function () {
    // Session check
    const currentUser = sessionStorage.getItem("username");

    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
        return;
    } else {
        console.log("Logged in as:", currentUser);
    }

    document.getElementById('viewResultsButton').addEventListener('click', navigateToHome);

    const resultsContainer = $('#scan-results').DataTable();

    updateIPAddress(resultsContainer);
});

function updateIPAddress(resultsContainer) {
    ipAddress = getIPFromURL();

    console.log(ipAddress);

    if (ipAddress) {
        document.querySelector('h2').textContent = ipAddress;

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
                                openPorts.push({ port: port, version: version });
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
