document.getElementById('startScanBtn').addEventListener('click', function() {
    // Check if the user is logged in by verifying the session storage
    const currentUser = sessionStorage.getItem("username");

    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
    } else {
        // Retrieve IP and subnet from user input fields
        var ipAddress = document.getElementById('ipAddress').value;
        var subnetMask = document.getElementById('subnetMask').value;

        // Redirect to the scan page with IP and subnet as query parameters
        window.location.href = `nmap-network.html?ip=${ipAddress}&subnet=${subnetMask}`;
    }
});
