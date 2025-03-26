const BASE_URL = 'http://192.168.68.64:5000';
let openPorts = [];

function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const ip = urlParams.get('ip');
    return ip === 'Unknown IP' ? '' : ip || '';
}


window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("uid");

    if (!currentUser) {
        sessionStorage.clear();  // Clears old session data
        localStorage.clear();    // Clears persistent stored data (optional)
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);
        document.querySelector('.ip-address').textContent = getIPFromURL();
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

$.fn.dataTable.ext.type.order['cve-id-desc'] = function (a, b) {
    // Extract the numeric part from CVE format (CVE-YYYY-XXXX)
    const numA = a.match(/CVE-(\d+)-(\d+)/);
    const numB = b.match(/CVE-(\d+)-(\d+)/);

    if (!numA || !numB) return 0; // If no match, do nothing

    // Parse year and number separately
    const yearA = parseInt(numA[1], 10);
    const idA = parseInt(numA[2], 10);
    const yearB = parseInt(numB[1], 10);
    const idB = parseInt(numB[2], 10);

    // First compare by year, then by CVE number
    return yearB - yearA || idB - idA;
};

function initializeDataTable() {
    const portTable = $('#portTable').DataTable({
        dom: 't',
        paging: false,
        searching: false,
        info: false,
        lengthChange: false,
        // Sort by the CVE Score column (index 5) descending
        order: [[5, 'desc']],
        columnDefs: [
            {
                targets: 5, // The CVE Score column index
                render: function (data, type, row, meta) {
                    // parseFloat handles numeric values, fallback to 0
                    const cveScore = parseFloat(data) || 0;
                    let bgColor;

                    if (isNaN(cveScore)) {
                        // If you have "N/A" or something non-numeric
                        bgColor = '#28a745'; // for example, green
                    } else if (cveScore >= 9.0) {
                        bgColor = '#dc3545'; // Critical => red
                    } else if (cveScore >= 7.0) {
                        bgColor = '#fd7e14'; // High => orange
                    } else if (cveScore >= 4.0) {
                        bgColor = '#ffc107'; // Medium => yellow
                    } else {
                        bgColor = '#28a745'; // Low => green
                    }

                    // Use a block-level element to fill the cell and preserve padding
                    // You can add inline padding if you want more space around the text
                    return `
            <div style="
              background-color: ${bgColor};
              color: #fff;
              width: 100%;
              height: 100%;
              text-align: center;
              padding: 8px; /* optional: to control spacing */
            ">
              ${data}
            </div>
          `;
                }
            }
        ]
    });

    // Then add your rows
    const openPorts = JSON.parse(localStorage.getItem('openPorts')) || [];
    openPorts.forEach(portInfo => {
        portTable.row.add([
            portInfo.port,
            '<td class="state open">open</td>',
            portInfo.service || 'N/A',
            portInfo.version || 'N/A',
            portInfo.cveId || 'N/A',
            portInfo.cveScore || 0
        ]).draw();
    });
}




let doughnutChart, progressChart; // Declare globally

function initializeCharts() {
    const doughnutCanvas = document.getElementById("doughnutChart");
    const progressChartCanvas = document.getElementById("progressChart");

    if (!doughnutCanvas || !progressChartCanvas) return;

    const doughnutCtx = doughnutCanvas.getContext("2d");
    const progressCtx = progressChartCanvas.getContext("2d");

    const storedVulnerabilities = JSON.parse(sessionStorage.getItem("vulnerabilitiesData")) || [];

    console.log("Initializing Charts - Stored Vulnerabilities:", storedVulnerabilities);

    let counts = { critical: 0, high: 0, medium: 0, low: 0 };

    if (storedVulnerabilities.length > 0) {
        storedVulnerabilities.forEach(v => {
            if (v.cve_score >= 9) counts.critical++;
            else if (v.cve_score >= 7) counts.high++;
            else if (v.cve_score >= 4) counts.medium++;
            else counts.low++;
        });
    }

    doughnutChart = new Chart(doughnutCtx, {
        type: "doughnut",
        data: {
            labels: ["Critical", "High", "Medium", "Low"],
            datasets: [{
                data: [counts.critical, counts.high, counts.medium, counts.low],
                backgroundColor: ["#ff6384", "#ff9f40", "#ffcd56", "#4bc0c0"],
                borderWidth: 0,
                cutout: "70%"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    align: "center",
                    labels: { boxWidth: 12, padding: 8, font: { size: 12 } }
                }
            },
            layout: { padding: { top: 15, bottom: 10 } }
        }
    });

    progressChart = new Chart(progressCtx, {
        type: "bar",
        data: {
            labels: [""],
            datasets: [
                { label: "Critical", data: [counts.critical], backgroundColor: "#ff6384" },
                { label: "High", data: [counts.high], backgroundColor: "#ff9f40" },
                { label: "Medium", data: [counts.medium], backgroundColor: "#ffcd56" },
                { label: "Low", data: [counts.low], backgroundColor: "#4bc0c0" }
            ]
        },
        options: {
            responsive: true,
            indexAxis: "y",
            scales: { x: { max: Math.max(10, counts.critical + counts.high + counts.medium + counts.low), beginAtZero: true } }
        }
    });

    if (storedVulnerabilities.length === 0) {
        console.log("No vulnerabilities found, clearing dashboard.");
        emptyDash();
        $('#saveCveReportBtn').hide();
    }
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
    console.log("Resetting Dashboard - Clearing Charts & Table");

    $('#portTable').DataTable().clear().draw();
    sessionStorage.removeItem('vulnerabilitiesData');
    sessionStorage.removeItem('chartData');

    if (doughnutChart) {
        doughnutChart.data.datasets[0].data = [0, 0, 0, 0];
        doughnutChart.update();
        console.log("Doughnut chart reset:", doughnutChart.data.datasets[0].data);
    }

    if (progressChart) {
        progressChart.data.datasets.forEach(dataset => dataset.data = [0]);
        progressChart.update();
        console.log("Progress chart reset:", progressChart.data.datasets.map(ds => ds.data));
    }

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
    console.log("Updating Charts - Received Vulnerabilities:", vulnerabilities);

    if (!vulnerabilities || vulnerabilities.length === 0) {
        console.log("No vulnerabilities received, resetting charts.");
        emptyDash();
        return;
    }

    const counts = { critical: 0, high: 0, medium: 0, low: 0 };

    vulnerabilities.forEach(v => {
        if (v.cve_score >= 9) counts.critical++;
        else if (v.cve_score >= 7) counts.high++;
        else if (v.cve_score >= 4) counts.medium++;
        else counts.low++;
    });

    console.log("Computed Vulnerability Counts:", counts);
    sessionStorage.setItem("chartData", JSON.stringify(counts));

    if (doughnutChart) {
        doughnutChart.data.datasets[0].data = [counts.critical, counts.high, counts.medium, counts.low];
        doughnutChart.update();
        console.log("Doughnut chart updated:", doughnutChart.data.datasets[0].data);
    } else {
        console.error("Doughnut chart is not initialized.");
    }

    if (progressChart) {
        progressChart.data.datasets[0].data = [counts.critical];
        progressChart.data.datasets[1].data = [counts.high];
        progressChart.data.datasets[2].data = [counts.medium];
        progressChart.data.datasets[3].data = [counts.low];
        progressChart.update();
        console.log("Progress chart updated:", progressChart.data.datasets.map(ds => ds.data));
    } else {
        console.error("Progress chart is not initialized.");
    }

    $('.vulnerability').text(`VULNERABILITY: ${((counts.critical + counts.high + counts.medium + counts.low) / 100).toFixed(2)}%`);
}


document.getElementById('saveCveReportBtn').addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.setItem("isHome", true);
    window.location.href = 'cvereport-details.html';
});