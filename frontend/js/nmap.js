function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


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

document.addEventListener("DOMContentLoaded", function() {
    // Check if the "scan" query parameter is present in the URL
    const scanType = getQueryParam("scan");


    // Optional: Customize the modal title or content based on scan type
    if (scanType === "network") {
        $('#scanNetworkModal').modal('show'); // Show the Network Scan modal
    } else if (scanType === "device") {
        $('#scanDeviceModal').modal('show'); // Show the Device Scan modal
    }
});

document.getElementById('startDeviceScanBtn').addEventListener('click', function() {
    // Check if the user is logged in by verifying the session storage
    const currentUser = sessionStorage.getItem("username");

    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
    } else {
        // Retrieve IP and subnet from user input fields
        var ip = document.getElementById('ip').value;

        // Redirect to the scan page with IP and subnet as query parameters
        window.location.href = `nmap-specific.html?ip=${ip}`;
    }
});



