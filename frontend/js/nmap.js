document.getElementById('startScanBtn').addEventListener('click', function() {
    var ipAddress = document.getElementById('ipAddress').value;
    var subnetMask = document.getElementById('subnetMask').value;

    window.location.href = `nmap-network.html?ip=${ipAddress}&subnet=${subnetMask}`;
});
