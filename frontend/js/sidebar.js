document.addEventListener('DOMContentLoaded', function () {
    // Load the sidebar content after the DOM is fully loaded
    const sidebarElement = document.getElementById('sidebar-container');

    if (!sidebarElement) {
        console.error("Sidebar container not found. Ensure it exists in the HTML.");
        return; // Exit if sidebar container does not exist
    }

    // Fetch the sidebar content
    fetch('/frontend/sidebar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load sidebar: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            sidebarElement.innerHTML = data; // Insert sidebar HTML into the page
            console.log("Sidebar loaded successfully");

            setUsername(); // Ensure username is set after sidebar loads
            setupLogoutButton(); // Attach event listener to logout button
        })
        .catch(error => {
            console.error("Error loading sidebar:", error);
        });
});

// Function to set the username in the sidebar
function setUsername() {
    const currentUser = sessionStorage.getItem("username");

    if (currentUser) {
        // Ensure this runs after sidebar is fully loaded
        setTimeout(() => {
            const usernameElement = document.getElementById("username");
            if (usernameElement) {
                usernameElement.textContent = currentUser; // Set the username
                console.log("Username set:", currentUser);
            } else {
                console.warn("Username element not found.");
            }
        }, 100); // Short delay to allow sidebar to render
    } else {
        console.warn("No user data found in session storage.");
    }
}

// Function to set up logout button
function setupLogoutButton() {
    setTimeout(() => { // Ensure sidebar is fully loaded before attaching event
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
    }, 100); // Short delay for sidebar to load before looking for logout button
}
