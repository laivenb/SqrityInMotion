const BASE_URL = 'http://192.168.5.102:5000';

function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const ip = urlParams.get('ip');
    return ip;
}

function updateIPAddress() {
    const ipAddress = getIPFromURL();

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

                const resultsContainer = $('#scan-results').DataTable();
                resultsContainer.clear();


                if (data.output) {
                    const lines = data.output.trim().split('\n');
                    lines.forEach(line => {
                        const parts = line.split(/\s+/);
                        if (parts.length >= 4) {
                            const port = parts[0];
                            const state = parts[1];
                            const service = parts[2];
                            const version = parts.slice(3).join(' ');
                            resultsContainer.row.add([port, state, service, version]);
                        }
                    });
                    resultsContainer.draw();
                } else {
                    resultsContainer.row.add(['', 'No results found or host is down.', '', '']).draw();
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        document.querySelector('h2').textContent = "Unknown IP";
    }
}

window.onload = function() {
    $('#scan-results').DataTable();
    updateIPAddress();
};
