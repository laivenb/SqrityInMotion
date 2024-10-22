document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('nmapForm');
    const spinner = document.querySelector('.loading-spinner');
    const submitButton = document.querySelector('.scan-btn');
    const cancelButton = document.getElementById('cancel-button');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        spinner.style.display = 'block';
        submitButton.disabled = true;

        const service = document.getElementById('service').value;
        const ipAddress = document.getElementById('ip-address').value;

        let apiEndpoint = '';
        let requestBody = {};

        if (service === 'specific-device') {
            apiEndpoint = 'http://192.168.1.29:5000/scan-device';
            requestBody = {
                ip: ipAddress,
            };
        } else if (service === 'network-scan') {
            const subnetMask = document.getElementById('subnet-mask').value;
            const networkAddress = ipAddress + subnetMask;

            apiEndpoint = 'http://192.168.1.29:5000/scan-network';
            requestBody = {
                network: networkAddress,
            };
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            console.log('Success:', data);

            localStorage.setItem('scanResult', JSON.stringify(data));

            spinner.style.display = 'none';
            submitButton.disabled = false;

            window.location.href = 'nmap-report.html';
        } catch (error) {
            console.error('Error:', error);

            spinner.style.display = 'none';
            submitButton.disabled = false;
        }
    });

    const scanResult = JSON.parse(localStorage.getItem('scanResult'));

    console.log(scanResult);

    cancelButton.addEventListener('click', function () {
        window.location.href = 'home.html';
    });
});


document.getElementById('startScanBtn').addEventListener('click', function() {
    var ipAddress = document.getElementById('ipAddress').value;
    var subnetMask = document.getElementById('subnetMask').value;


    window.location.href = `nmap-network.html?ip=${ipAddress}&subnet=${subnetMask}`;
});


