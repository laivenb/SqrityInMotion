document.addEventListener("DOMContentLoaded", function () {
    function isValidIP(ip) {
        const ipPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
        return ipPattern.test(ip);
    }

    function validateIP(inputId, event) {
        const ipInput = document.getElementById(inputId);
        const ip = ipInput.value.trim();

        if (!isValidIP(ip)) {
            showModal("Invalid IP address! Please enter a valid IPv4 address.");
            event.preventDefault();
            return false;
        }
        return true;
    }

    document.getElementById("startScanBtn").addEventListener("click", function (event) {
        if (!validateIP("ipAddress", event)) return;

        const currentUser = sessionStorage.getItem("username");
        if (!currentUser) {
            window.location.href = "login.html";
        } else {
            const ipAddress = document.getElementById('ipAddress').value;
            const subnetMask = document.getElementById('subnetMask').value;
            window.location.href = `nmap-network.html?ip=${ipAddress}&subnet=${subnetMask}`;
        }
    });

    document.getElementById("startDeviceScanBtn").addEventListener("click", function (event) {
        if (!validateIP("ip", event)) return;

        const currentUser = sessionStorage.getItem("username");
        if (!currentUser) {
            window.location.href = "login.html";
        } else {
            const ip = document.getElementById('ip').value;
            window.location.href = `nmap-specific.html?ip=${ip}`;
        }
    });

    const scanType = getQueryParam("scan");
    if (scanType === "network") {
        $('#scanNetworkModal').modal('show');
    } else if (scanType === "device") {
        $('#scanDeviceModal').modal('show');
    }
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
}



