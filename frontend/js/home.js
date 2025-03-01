const BASE_URL = 'http://192.168.68.62:5000';
let openPorts = [];

function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ip') || 'Unknown IP';
}

window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);
        const ipAddress = getIPFromURL();
        document.querySelector('.ip-address').textContent = ipAddress;
        initializeDataTable();
    }
});

$(document).ready(function () {
    const openPorts = JSON.parse(localStorage.getItem('openPorts')) || [];
    if (openPorts.length > 0) {
        $('#pentestButton').show();
        fetchVulnerabilities(openPorts);
    } else {
        $('#pentestButton').hide();
    }
    initializeCharts();
});

$('#pentestButton').on('click', function() {
    const portTable = $('#portTable').DataTable();
    const portDetailsArray = [];

    portTable.rows().every(function() {
        const data = this.data();
        portDetailsArray.push({
            port: data[0],
            service: data[2],
            version: data[3],
            cveId: data[4]
        });
    });

    sessionStorage.setItem('portDetailsArray', JSON.stringify(portDetailsArray));
    window.location.href = `pentest-result.html?ip=${getIPFromURL()}`;
});

function initializeDataTable() {
    const firstLogin = sessionStorage.getItem('firstLogin') === 'true';
    const portTable = $('#portTable').DataTable({
        "pagingType": "simple_numbers",
        "searching": true,
        "ordering": true,
        "order": [[0, "asc"]],
        "createdRow": function(row, data) {
            $(row).on('click', function() {
                sessionStorage.setItem('selectedPortInfo', JSON.stringify({
                    port: data[0],
                    service: data[2],
                    version: data[3],
                    cveId: data[4]
                }));
                window.location.href = `port-specific.html?ip=${getIPFromURL()}`;
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

    if (firstLogin) emptyDash();
}

function initializeCharts() {
    const doughnutCanvas = document.getElementById("doughnutChart");
    const progressChartCanvas = document.getElementById('progressChart');
    if (!doughnutCanvas || !progressChartCanvas) return;

    const doughnutCtx = doughnutCanvas.getContext("2d");
    doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'Medium', 'Low'],
            datasets: [{
                data: [10, 30, 40],
                backgroundColor: ['#ff6384', '#ffcd56', '#4bc0c0']
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const progressCtx = progressChartCanvas.getContext('2d');
    progressChart = new Chart(progressCtx, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                { label: 'Critical', data: [40], backgroundColor: '#ff6384' },
                { label: 'Medium', data: [30], backgroundColor: '#ffcd56' },
                { label: 'Low', data: [30], backgroundColor: '#4bc0c0' }
            ]
        },
        options: { responsive: true, indexAxis: 'y', scales: { x: { max: 100 } } }
    });
}

function fetchVulnerabilities(openPorts) {
    $.ajax({
        type: 'POST',
        url: `${BASE_URL}/get_vulnerabilities`,
        contentType: 'application/json',
        data: JSON.stringify({ ports_and_versions: openPorts.map(p => ({ port: p.port, version: p.version })) }),
        success: function (response) {
            updatePortTable(response);
            updateCharts(response);
        },
        error: function (error) {
            console.error("Error fetching vulnerabilities:", error);
        }
    });
}

function emptyDash() {
    $('#portTable').DataTable().clear().draw();
    $('#saveCveReportBtn').hide();
    sessionStorage.removeItem('vulnerabilitiesData');
    doughnutChart.data.datasets[0].data = [0, 0, 0];
    doughnutChart.update();
    progressChart.data.datasets.forEach(dataset => dataset.data = [0]);
    progressChart.update();
    $('.vulnerability').text("VULNERABILITY: 0%");
}

function updatePortTable(vulnerabilities) {
    const portTable = $('#portTable').DataTable();
    portTable.clear();
    const tableData = vulnerabilities.map(v => ({
        port: v.port || 'N/A',
        state: 'open',
        version: v.version || 'N/A',
        cve_id: v.cve_id || 'N/A',
        cve_score: v.cve_score || 'N/A'
    }));

    tableData.forEach(data => {
        portTable.row.add([data.port, '<td class="state open">open</td>', data.version, data.cve_id, data.cve_score]);
    });

    portTable.draw();
    sessionStorage.setItem("vulnerabilitiesData", JSON.stringify(tableData));
}

function updateCharts(vulnerabilities) {
    const counts = { critical: 0, medium: 0, low: 0 };
    vulnerabilities.forEach(v => {
        if (v.cve_score >= 7) counts.critical++;
        else if (v.cve_score >= 4) counts.medium++;
        else counts.low++;
    });
    const total = counts.critical + counts.medium + counts.low;
    if (total > 0) {
        doughnutChart.data.datasets[0].data = [counts.critical, counts.medium, counts.low];
        doughnutChart.update();
        progressChart.data.datasets[0].data = [counts.critical];
        progressChart.data.datasets[1].data = [counts.medium];
        progressChart.data.datasets[2].data = [counts.low];
        progressChart.update();
        $('.vulnerability').text(`VULNERABILITY: ${(total / 100).toFixed(2)}%`);
    }
}

document.getElementById('saveCveReportBtn').addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.setItem("isHome", true);
    window.location.href = 'cvereport-details.html';
});