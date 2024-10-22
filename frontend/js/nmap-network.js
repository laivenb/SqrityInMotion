const BASE_URL = 'http://192.168.5.102:5000';

function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let ip = getQueryParam('ip');
let subnet = getQueryParam('subnet');

document.getElementById('startScanButton').addEventListener('click', function () {
    if (ip && subnet) {
        startScanning(ip, subnet);
    } else {
        alert('IP address and subnet mask are required to start scanning.');
    }
});

function startScanning(ip, subnet) {
    const baseIP = ip.split('.').map(Number);
    let startHost = 0;
    let endHost = 0;
    const ipList = [];

    // Clear table only once at the start
    const tableBody = document.querySelector('#portTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    switch (subnet) {
        case '/16':
            startHost = 0;
            endHost = 255;
            for (let i = 0; i <= 255; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/24':
            startHost = 1;
            endHost = 254;
            for (let i = startHost; i <= endHost; i++) {
                let hostIP = `${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`;
                ipList.push(hostIP);
            }
            break;
        default:
            console.error('Unsupported subnet prefix.');
            return;
    }

    scanHost(ipList);
}

async function scanHost(ipList) {
    const tableBody = document.querySelector('#portTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    // Batch size to limit concurrent scans
    const batchSize = 5; // Adjust as needed
    for (let i = 0; i < ipList.length; i += batchSize) {
        const batch = ipList.slice(i, i + batchSize);

        // Trigger scans for all IPs in the batch
        const scanPromises = batch.map(async (ip) => {
            try {
                const response = await $.ajax({
                    url: `${BASE_URL}/scan-device`,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ ip: ip }),
                    timeout: 60000, // 60 seconds timeout
                });

                console.log("Scan result for IP:", ip, response);
                populateTable(response.output, ip);
            } catch (error) {
                console.error(`Error during scanning for IP ${ip}:`, error);
                // Handle error by marking the IP as unreachable
                populateTable([{ ip: ip, hostStatus: 'down', portStatus: 'closed' }], ip);
            }
        });

        // Wait for all scans in the batch to complete
        await Promise.all(scanPromises);

        // Add delay between batches to avoid overwhelming the server
        await delay(1000); // 1-second delay between batches
    }

    console.log("All scans completed.");
}

// Delay function for a given number of milliseconds
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function populateTable(output, ip) {
    const tableBody = document.querySelector('#portTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    if (typeof output === 'string') {
        console.log(`No devices found for IP: ${ip}`);
        // Optionally, add a row indicating no device found
        const newRow = document.createElement('tr');

        const ipCell = document.createElement('td');
        ipCell.textContent = ip;

        const statusCell = document.createElement('td');
        statusCell.textContent = 'DOWN';

        const portStatusCell = document.createElement('td');
        portStatusCell.textContent = 'N/A';

        const actionCell = document.createElement('td');
        actionCell.textContent = 'No action';

        newRow.appendChild(ipCell);
        newRow.appendChild(statusCell);
        newRow.appendChild(portStatusCell);
        newRow.appendChild(actionCell);

        tableBody.appendChild(newRow);

        return;
    }

    if (!Array.isArray(output)) {
        console.error(`Output is not an array for IP ${ip}:`, output);
        return;
    }

    output.forEach(device => {
        const newRow = document.createElement('tr');

        const ipCell = document.createElement('td');
        ipCell.textContent = device.ip || ip;

        const statusCell = document.createElement('td');
        statusCell.textContent = device.hostStatus === 'up' ? 'UP' : 'DOWN';

        const portStatusCell = document.createElement('td');
        portStatusCell.textContent = device.portStatus === 'open' ? 'OPEN' : 'CLOSED';

        const actionCell = document.createElement('td');
        const actionButton = document.createElement('button');
        actionButton.textContent = 'Action';
        actionButton.className = 'btn btn-primary';

        actionButton.setAttribute('data-ip', device.ip || ip);

        actionButton.onclick = function () {
            const clickedIp = this.getAttribute('data-ip');
            console.log(`Action for ${clickedIp} triggered`);
            window.location.href = `nmap-specific.html?ip=${clickedIp}`;
        };

        actionCell.appendChild(actionButton);

        newRow.appendChild(ipCell);
        newRow.appendChild(statusCell);
        newRow.appendChild(portStatusCell);
        newRow.appendChild(actionCell);

        tableBody.appendChild(newRow);
    });
}
