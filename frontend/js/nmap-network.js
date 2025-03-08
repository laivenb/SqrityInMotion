const BASE_URL = 'http://192.168.68.62:5000';

// On page load, check session and automatically start scanning if parameters exist
window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);
    }

    const ip = getQueryParam('ip');
    const subnet = getQueryParam('subnet');
    if (ip && subnet) {
        showSpinner();
        startScanning(ip, subnet).then(() => {
            alert("Scanning completed!");
        });
    }

});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function showSpinner() {
    document.getElementById("loadingSpinner").style.display = "block";
}

function hideSpinner() {
    document.getElementById("loadingSpinner").style.display = "none";
}

function startScanning(ip, subnet) {
    return new Promise(async (resolve) => {
        const baseIP = ip.split('.').map(Number);
        let startHost = 0, endHost = 0;
        const ipList = [];
        const tableBody = document.querySelector('#portTable tbody');

        if (tableBody) {
            tableBody.innerHTML = ''; // Clear table on new scan
        }

        switch (subnet) {
            case '/16': startHost = 0; endHost = 255; break;
            case '/17': startHost = 0; endHost = 127; break;
            case '/18': startHost = 0; endHost = 63; break;
            case '/19': startHost = 0; endHost = 31; break;
            case '/20': startHost = 0; endHost = 15; break;
            case '/21': startHost = 0; endHost = 7; break;
            case '/22': startHost = 0; endHost = 3; break;
            case '/23': startHost = 0; endHost = 1; break;
            case '/24': startHost = 1; endHost = 254; break;
            case '/25': startHost = 1; endHost = 126; break;
            case '/26': startHost = 1; endHost = 62; break;
            case '/27': startHost = 1; endHost = 30; break;
            case '/28': startHost = 1; endHost = 14; break;
            case '/29': startHost = 1; endHost = 6; break;
            case '/30': startHost = baseIP[3]; endHost = baseIP[3] + 3; break;
            default:
                console.error('Unsupported subnet prefix.');
                hideSpinner();
                resolve();
                return;
        }

        if (subnet.startsWith('/16') || subnet.startsWith('/17') || subnet.startsWith('/18')) {
            for (let i = startHost; i <= endHost; i++) {
                for (let j = 0; j <= 255; j++) {
                    ipList.push(`${baseIP[0]}.${baseIP[1]}.${i}.${j}`);
                }
            }
        } else {
            for (let i = startHost; i <= endHost; i++) {
                ipList.push(`${baseIP[0]}.${baseIP[1]}.${baseIP[2]}.${i}`);
            }
        }

        console.log('Scanning started...');
        await scanHost(ipList);  // Wait until scanHost completes
        hideSpinner();
        resolve();  // Signal that scanning is done
    });
}


async function scanHost(ipList) {
    const tableBody = document.querySelector('#portTable tbody');
    if (!tableBody) {
        console.error('Table body not found');
        hideSpinner();
        return;
    }

    // Process scans in batches to control concurrency
    const batchSize = 5;
    for (let i = 0; i < ipList.length; i += batchSize) {
        const batch = ipList.slice(i, i + batchSize);
        const scanPromises = batch.map(async (ip) => {
            try {
                const response = await $.ajax({
                    url: `${BASE_URL}/scan-device`,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ ip: ip }),
                    timeout: 60000
                });
                console.log("Scan result for IP:", ip, response);
                populateTable(response.output, ip);
            } catch (error) {
                console.error(`Error scanning IP ${ip}:`, error);
                populateTable([{ ip: ip, hostStatus: 'up', portStatus: 'open' }], ip);
            }
        });
        await Promise.all(scanPromises);
        await delay(1000);
    }
    console.log("Scanning completed.");
    hideSpinner();
}

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
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<td>${ip}</td>
                            <td>DOWN</td>
                            <td>N/A</td>
                            <td>No action</td>`;
        tableBody.appendChild(newRow);
        return;
    }

    if (!Array.isArray(output)) {
        console.error(`Unexpected output for IP ${ip}:`, output);
        return;
    }

    output.forEach(device => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<td>${device.ip || ip}</td>
                            <td>${device.hostStatus === 'up' ? 'UP' : 'DOWN'}</td>
                            <td>${device.portStatus === 'open' ? 'OPEN' : 'CLOSED'}</td>
                            <td><button class="btn btn-primary" data-ip="${device.ip || ip}" onclick="handleAction(this)">Action</button></td>`;
        tableBody.appendChild(newRow);
    });
}

function handleAction(button) {
    const clickedIp = button.getAttribute('data-ip');
    console.log(`Action for ${clickedIp} triggered`);
    window.location.href = `nmap-specific.html?ip=${clickedIp}`;
}
