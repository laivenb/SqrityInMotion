const BASE_URL = 'http://192.168.1.105:5000';
let openPorts = [];

function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const ip = urlParams.get('ip');
    console.log(ip);
    return ip;
}
window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);


        ipAddress = getIPFromURL();
        console.log(ipAddress);
        const ipAddressElement = document.querySelector('.ip-address');

        if (ipAddress) {
            ipAddressElement.textContent = ipAddress;
            console.log("IP Address:", ipAddress);
        } else {
            ipAddressElement.textContent = "Unknown IP";
        }

        initializeDataTable();
    }
});

$(document).ready(function () {
    const openPorts = JSON.parse(localStorage.getItem('openPorts')) || [];
    console.log("Open ports from localStorage:", openPorts);

    if (openPorts.length > 0) {
        $('#pentestButton').show();
        fetchVulnerabilities(openPorts);
    } else {
        console.log("No open ports found.");
        $('#pentestButton').hide();
    }

    // Initialize charts
    initializeCharts();
});

// Add an event listener to the Pentest button
$('#pentestButton').on('click', function() {
    const portTable = $('#portTable').DataTable();
    const portDetailsArray = [];

    portTable.rows().every(function() {
        const data = this.data();
        const portDetails = {
            port: data[0],
            service: data[2],
            version: data[3],
            cveId: data[4]
        };
        portDetailsArray.push(portDetails);
    });
    ipAddress = getIPFromURL();

    sessionStorage.setItem('portDetailsArray', JSON.stringify(portDetailsArray));

    console.log("Port Details Array:", portDetailsArray);

    window.location.href = `pentest-result.html?ip=${ipAddress}`;
});


// Initialize DataTable
function initializeDataTable() {
    const portTable = $('#portTable').DataTable({
        "pagingType": "simple_numbers",
        "searching": true,
        "ordering": true,
        "order": [[0, "asc"]],
        "createdRow": function(row, data) {

            $(row).on('click', function() {
                const selectedPortInfo = data[0];
                const portInfoToStore = {
                    port: selectedPortInfo,
                    service: data[2],
                    version: data[3],
                    cveId: data[4]
                };

                sessionStorage.setItem('selectedPortInfo', JSON.stringify(portInfoToStore));

                window.location.href = `port-specific.html`;
            });
        }
    });

    const openPorts = JSON.parse(localStorage.getItem('openPorts')) || [];

    openPorts.forEach(portInfo => {

        portTable.row.add([
            portInfo.port,
            '<td class="state open">open</td>',
            portInfo.service || 'N/A',
            portInfo.version || 'N/A',
            portInfo.cveId || 'N/A'
        ]).draw();
    });
}







// Initialize Charts
function initializeCharts() {
    const doughnutCanvas = document.getElementById("doughnutChart");
    const doughnutCtx = doughnutCanvas && doughnutCanvas.getContext("2d");

    doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'Medium', 'Low'],
            datasets: [{
                label: 'Vulnerability Levels',
                data: [10, 30, 40],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 205, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                }
            }
        }
    });

    const progressChartCanvas = document.getElementById('progressChart').getContext('2d');

    progressChart = new Chart(progressChartCanvas, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: 'Critical',
                    data: [40],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                },
                {
                    label: 'Medium',
                    data: [30],
                    backgroundColor: 'rgba(255, 205, 86, 0.7)',
                    borderColor: 'rgba(255, 205, 86, 1)',
                },
                {
                    label: 'Low',
                    data: [30],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            elements: {
                bar: {
                    borderWidth: 0
                }
            }
        }
    });
}

function fetchVulnerabilities(openPorts) {
    const data = {
        ports_and_versions: openPorts.map(port => ({
            port: port.port,
            version: port.version
        }))
    };

    console.log("Sending data to server:", data);

    $.ajax({
        type: 'POST',
        url: `${BASE_URL}/get_vulnerabilities`,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            console.log("Received data from server:", response);
            updatePortTable(response);
            updateCharts(response);
        },
        error: function (error) {
            console.error("Error fetching vulnerabilities:", error);
        }
    });
}

function updatePortTable(vulnerabilities) {
    const portTable = $('#portTable').DataTable();
    portTable.clear();

    vulnerabilities.forEach(vulnerability => {
        portTable.row.add([
            vulnerability.port || 'N/A',
            '<td class="state open">open</td>',
            vulnerability.version || 'N/A',
            vulnerability.cve_id || 'N/A',
            vulnerability.cve_score || 'N/A'
        ]);
    });

    portTable.draw();
}

function updateCharts(vulnerabilities) {
    const criticalCount = vulnerabilities.filter(v => v.cve_score >= 7).length;
    const mediumCount = vulnerabilities.filter(v => v.cve_score >= 4 && v.cve_score < 7).length;
    const lowCount = vulnerabilities.filter(v => v.cve_score < 4).length;

    const totalCount = criticalCount + mediumCount + lowCount;

    const criticalPercentage = totalCount > 0 ? (criticalCount / totalCount) * 100 : 0;
    const mediumPercentage = totalCount > 0 ? (mediumCount / totalCount) * 100 : 0;
    const lowPercentage = totalCount > 0 ? (lowCount / totalCount) * 100 : 0;

    doughnutChart.data.datasets[0].data = [criticalPercentage, mediumPercentage, lowPercentage];
    doughnutChart.update();

    progressChart.data.datasets[0].data = [criticalPercentage];
    progressChart.data.datasets[1].data = [mediumPercentage];
    progressChart.data.datasets[2].data = [lowPercentage];
    progressChart.update();

    const totalVulnerabilityPercentage = criticalPercentage + mediumPercentage + lowPercentage;
    $('.vulnerability').text(`VULNERABILITY: ${totalVulnerabilityPercentage.toFixed(2)}%`);
}