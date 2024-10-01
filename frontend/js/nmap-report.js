document.addEventListener('DOMContentLoaded', function () {
    const exitButton = document.querySelector('.exit-btn');
    if (exitButton) {
        exitButton.addEventListener('click', function () {
            const confirmation = confirm("Are you sure you want to exit without saving?");
            if (confirmation) {
                window.location.href = 'home.html';
            }
        });
    }

    const downloadButtons = document.querySelectorAll('.blue-download-btn, .gray-download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function () {
            alert("Successfully downloaded");
            window.location.href = 'home.html';
        });
    });

    const saveButton = document.querySelector('.save-btn');
    if (saveButton) {
        saveButton.addEventListener('click', function () {
            alert("Saved Successfully!");
            window.location.href = 'home.html';
        });
    }

    const scanResult = JSON.parse(localStorage.getItem('scanResult'));

    console.log(scanResult);

    if (scanResult) {
        const reportContent = document.querySelector('.report-content');

        let reportHtml = `<h3>Scan Result:</h3>`;

        if (scanResult.type === "scan-network") {
            reportHtml += `<p>${scanResult.message}</p>`;

            if (scanResult.ip_addresses && scanResult.ip_addresses.length > 0) {
                reportHtml += `<h4>Detected IP Addresses:</h4><ul>`;

                scanResult.ip_addresses.forEach(ip => {
                    reportHtml += `<li>${ip}</li>`;
                });

                reportHtml += `</ul>`;
            }

            let formattedOutput = scanResult.output.replace(/\n/g, '<br>');
            reportHtml += `<h4>Full Nmap Output:</h4><pre>${formattedOutput}</pre>`;

        } else if (scanResult.type === "scan-device") {
            reportHtml += `<p>${scanResult.message}</p>`;
            let formattedOutput = scanResult.output.replace(/\n/g, '<br>');
            reportHtml += `<h4>Full Nmap Output:</h4><pre>${formattedOutput}</pre>`;
        }

        reportContent.innerHTML = reportHtml;

    } else {
        document.querySelector('.report-content').innerHTML = '<p>No scan result found.</p>';
    }





    console.log(scanResult);

});
