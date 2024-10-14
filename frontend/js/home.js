$(document).ready(function () {
    $('#portTable').DataTable({
        "pagingType": "simple_numbers",  // Pagination style
        "searching": true,               // Enable search/filter
        "ordering": true,                // Enable sorting
        "order": [[0, "asc"]]            // Initial sorting (optional)
    });
});

// Doughnut Chart Start
const doughnutCanvas = document.getElementById("doughnutChart");
const doughnutCtx = doughnutCanvas && doughnutCanvas.getContext("2d");

if (doughnutCtx) {
    new Chart(doughnutCtx, {
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
} else {
    console.log("Doughnut chart canvas not found!");
}

// Line Bar Start
const progressChartCanvas = document.getElementById('progressChart').getContext('2d');

const progressData = {
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
            borderColor: 'rgba(255, 205, 86, 1)',
        }
    ]
};

const progressOptions = {
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
                label: function(context) {
                    return `${context.dataset.label}: ${context.raw}%`;
                }
            }
        }
    },
    elements: {
        bar: {
            borderWidth: 0
        }
    },
    backgroundColor: 'rgba(0, 0, 0, 0)'
};


new Chart(progressChartCanvas, {
    type: 'bar',
    data: progressData,
    options: progressOptions
});
// Line Bar End

