const BASE_URL = 'http://192.168.1.105:5000';

// Function to check session on page load
document.getElementById('startScanButton').addEventListener('click', function () {
    this.disabled = true;
    this.textContent = "Scanning..."; // Optional: Update button text to show action in progress

    // You can also add the code to trigger the scan here
});

window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");

    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);
    }
});

function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);7
    return urlParams.get(param);
}

let ip = getQueryParam('ip');
let subnet = getQueryParam('subnet');

document.getElementById('startScanButton').addEventListener('click', function () {
    // Check if IP and subnet are provided
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
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/17':
            startHost = 0;
            endHost = 127;
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/18':
            startHost = 0;
            endHost = 63;
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/19':
            startHost = 0;
            endHost = 31;
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/20':
            startHost = 0;
            endHost = 15;
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/21':
            startHost = 0;
            endHost = 7;
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/22':
            startHost = 0;
            endHost = 3;
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    let hostIP = `${baseIP[0]}.${baseIP[1]}.${i}.${j}`;
                    ipList.push(hostIP);
                }
            }
            break;
        case '/23':
            startHost = 0;
            endHost = 1;
            for (let i = startHost; i <= endHost; i++) {
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
                console.log('subnet24');
            }
            break;
        case '/25':
            startHost = 1;
            endHost = 126;
            for (let i = startHost; i <= endHost; i++) {
                let hostIP = `${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`;
                ipList.push(hostIP);
            }
            break;
        case '/26':
            startHost = 1;
            endHost = 62;
            for (let i = startHost; i <= endHost; i++) {
                let hostIP = `${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`;
                ipList.push(hostIP);
            }
            break;
        case '/27':
            startHost = 1;
            endHost = 30;
            for (let i = startHost; i <= endHost; i++) {
                let hostIP = `${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`;
                ipList.push(hostIP);
            }
            break;
        case '/28':
            startHost = 1;
            endHost = 14;
            for (let i = startHost; i <= endHost; i++) {
                let hostIP = `${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`;
                ipList.push(hostIP);
            }
            break;
        case '/29':
            startHost = 1;
            endHost = 6;
            for (let i = startHost; i <= endHost; i++) {
                let hostIP = `${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`;
                ipList.push(hostIP);
            }
            break;
        case '/30':
            startHost = baseIP[3];
            endHost = baseIP[3] + 3;
            for (let i = startHost; i <= endHost; i++) {
                let hostIP = `${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`;
                ipList.push(hostIP);
            }
            break;
        default:
            console.error('Unsupported subnet prefix.');
            return;
    }

    console.log('scanning');
    scanHost(ipList);
    console.log('scanning');
}

async function scanHost(ipList) {
    const tableBody = document.querySelector('#portTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    // Batch size to limit concurrent scans
    const batchSize = 5;
    for (let i = 0; i < ipList.length; i += batchSize) {
        const batch = ipList.slice(i, i + batchSize);
        console.log('scan-device');
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
