document.addEventListener('DOMContentLoaded', function () {
    // Load the sidebar content after the DOM is fully loaded
    const sidebarElement = document.getElementById('sidebar-container'); // Get the correct element

    if (!sidebarElement) {
        console.error("Sidebar container not found. Ensure it exists in the HTML.");
        return; // Exit if sidebar container does not exist
    }

    // Proceed to fetch the sidebar content
    fetch('/frontend/adminside.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load sidebar: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            sidebarElement.innerHTML = data; // Insert sidebar HTML into the page
            console.log("Sidebar loaded successfully");
            setUsername(); // Call to set the username in the sidebar after loading
        })
        .catch(error => {
            console.error("Error loading sidebar:", error);
        });
});

const db = firebase.database();

// Fetch total users and total requests from Firebase
function fetchData() {
    db.ref('/path_to_total_users').once('value').then(snapshot => {
        const totalUsers = snapshot.val();
        document.getElementById("total-users").textContent = totalUsers;
    });

    db.ref('/path_to_total_requests').once('value').then(snapshot => {
        const totalRequests = snapshot.val();
        document.getElementById("total-requests").textContent = totalRequests;
    });
}

// Call fetchData on page load
fetchData();
function setUsername() {
    // Get the username directly from sessionStorage (no need for JSON.parse)
    const currentUser = sessionStorage.getItem("username");

    if (currentUser) {
        const usernameElement = document.getElementById("username");
        if (usernameElement) {
            usernameElement.textContent = currentUser; // Set the username directly
        } else {
            console.warn("Username element not found.");
        }
    } else {
        console.warn("No user data found.");
    }
}