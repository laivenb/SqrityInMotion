document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('nmapForm');
    const cancelButton = document.getElementById('cancel-button');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        window.location.href = 'nmap-report.html';
    });

    cancelButton.addEventListener('click', function () {
        window.location.href = 'home.html';
    });
});
