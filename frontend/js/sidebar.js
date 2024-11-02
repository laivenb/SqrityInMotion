window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
    } else {
        const userData = JSON.parse(currentUser);
        console.log("Logged in as:", userData.username);
        document.getElementById('user-name').textContent = userData.username;

        // Initialize DataTable after checking user
        initializeDataTable();
    }
});

function checkUserSession() {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
    } else {
        const userData = JSON.parse(currentUser);
        console.log("Logged in as:", userData.username);
        document.getElementById('user-name').textContent = userData.username;
        // Initialize DataTable after checking user
        initializeDataTable();
    }
}

window.addEventListener('load', () => {
    // Check user session
    checkUserSession();
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and load the sidebar
    fetch('/frontend/sidebar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load sidebar: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            console.log("Sidebar content loaded:", data);
            document.getElementById('sidebar-container').innerHTML = data;

            // After sidebar is loaded, check for user session and set username
            const currentUser = sessionStorage.getItem("username");
            if (!currentUser) {
                // If not logged in, redirect to login page
                window.location.href = "login.html";
            } else {
                const userData = JSON.parse(currentUser);
                console.log("Logged in as:", userData.username);

                // Set the username in the sidebar
                $('#user-name').text(userData.username);

                // Initialize DataTable after checking user
                initializeDataTable();
            }
        })
        .catch(error => {
            console.error("Error loading sidebar:", error);
        });
});

// Function to initialize DataTable
function initializeDataTable() {
    const portTable = $('#portTable').DataTable({
        "pagingType": "simple_numbers",
        "searching": true,
        "ordering": true,
        "order": [[0, "asc"]]
    });

    const openPorts = JSON.parse(localStorage.getItem('openPorts')) || [];
    console.log("Open ports from localStorage:", openPorts);

    const portsTableBody = $('#portTable tbody');
    openPorts.forEach(portInfo => {
        portsTableBody.append(`
            <tr>
                <td>${portInfo.port}</td>
                <td class="state open">open</td>
                <td>${portInfo.service || 'N/A'}</td>
                <td>${portInfo.version}</td>
                <td>${portInfo.cveId || 'N/A'}</td>
            </tr>
        `);
    });

    portTable.draw();

    if (openPorts.length > 0) {
        fetchVulnerabilities(openPorts);
    } else {
        console.log("No open ports found.");
    }
}
