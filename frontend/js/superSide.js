document.addEventListener('DOMContentLoaded', function () {
    // Load the sidebar content after the DOM is fully loaded
    const sidebarElement = document.getElementById('sidebar-container');

    if (!sidebarElement) {
        console.error("Sidebar container not found. Ensure it exists in the HTML.");
        return; // Exit if sidebar container does not exist
    }

    // Proceed to fetch the sidebar content
    fetch('/frontend/superSide.html')
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
            setupLogoutButton(); // Setup the logout functionality
        })
        .catch(error => {
            console.error("Error loading sidebar:", error);
        });
});




// Function to set the username in the sidebar
function setUsername() {
    // Get the username directly from sessionStorage
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

// Function to handle logout functionality
function setupLogoutButton() {
    const logoutButton = document.querySelector('.logout-btn');

    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            sessionStorage.clear(); // Clear session storage to end session
            console.log("Session cleared. Logging out...");
            window.location.href = "login.html"; // Redirect to login page
        });
    } else {
        console.warn("Logout button not found.");
    }
}
