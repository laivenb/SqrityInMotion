document.addEventListener('DOMContentLoaded', function () {

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
        })
        .catch(error => {
            console.error("Error loading sidebar:", error);
        });
});
