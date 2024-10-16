const BASE_URL = 'http://192.168.1.29:5000';

function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


let ip = getQueryParam('ip');
let subnet = getQueryParam('subnet');


if (ip) {
    document.querySelector('.IPheader h2').textContent = `${ip} ${subnet}`;
    startScanning(ip, subnet);
}


function startScanning(ip, subnet) {
    const baseIP = ip.split('.').map(Number);
    let startHost = 0;
    let endHost = 0;
    const ipList = [];


    const tableBody = document.querySelector('#portTable tbody');
    tableBody.innerHTML = '';


    switch (subnet) {
        case '/16':
            startHost = 1;
            endHost = 254;
            for (let i = 0; i < 256; i++) {
                for (let j = 1; j < 256; j++) {
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


function scanHost(ipList) {
    const promises = ipList.map(ip => {
        return $.ajax({
            url: `${BASE_URL}/scan-device`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ ip: ip }),
        })
            .then(response => {
                console.log("Scan result for IP:", ip, response);
                populateTable(response.output, ip);
            })
            .catch(error => {
                console.error("Error during scanning:", error);

                if (error.responseText) {
                    console.error("Error response:", error.responseText);
                }
            });
    });


    Promise.all(promises)
        .then(() => {
            console.log("All scans completed.");
        })
        .catch((error) => {
            console.error("Error during scanning:", error);
        });
}

function populateTable(output, ip) {
    const tableBody = document.querySelector('#portTable tbody');

    if (typeof output === 'string') {
        console.log("No devices found for IP:", ip);
        return;
    }

    if (!Array.isArray(output)) {
        console.error("Output is not an array:", output);
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


        actionButton.onclick = function() {
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
