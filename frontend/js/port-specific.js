const BASE_URL = 'http://192.168.5.102:5000';

window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);

        // Initialize DataTable after checking user
        initializeDataTable();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Retrieve the selected port info from sessionStorage
    const portInfo = JSON.parse(sessionStorage.getItem('selectedPortInfo'));

    if (portInfo) {
        // Populate the port details on the page
        document.getElementById('portDetails').innerText = `
            Port: ${portInfo.port}
            Service: ${portInfo.service || 'N/A'}
            CVE ID: ${portInfo.cveId || 'N/A'}
            Version: ${portInfo.version || 'N/A'}
        `;

        const portService = portInfo.service; // Changed to const to avoid confusion

        // Set up the search button functionality
        const searchSploitButton = document.getElementById('searchSploitButton');
        searchSploitButton.addEventListener('click', function() {
            if (portService) { // Changed to use portService
                const apiUrl = `${BASE_URL}/searchSploit?service=${encodeURIComponent(portService)}`; // Create the API URL

                // Make an AJAX request to the Flask endpoint
                fetch(apiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.error) {
                            // Handle the error response
                            alert(`Error: ${data.error}`);
                        } else {
                            // Process the successful response
                            const cleanedOutput = cleanSearchSploitResults(data.output);
                            console.log("Cleaned Search Results:", cleanedOutput); // Display or handle the results as needed

                            // Ensure the element exists before trying to set its innerText
                            const resultsDiv = document.getElementById('searchSploitResults');
                            if (resultsDiv) {
                                resultsDiv.innerHTML = cleanedOutput; // Display formatted results
                            } else {
                                console.error("Results div not found");
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching search results:', error);
                    });
            } else {
                alert('No service information available to search.');
            }
        });

        // Set up the Metasploit search button functionality
        // Set up the Metasploit search button functionality
        const msfSearchButton = document.getElementById('msfSearchButton');
        const attackPortButton = document.getElementById('attackPortButton'); // Get the button element

        msfSearchButton.addEventListener('click', function() {
            if (portService) { // Changed to use portService
                const apiUrl = `${BASE_URL}/searchmsf?service=${encodeURIComponent(portService)}`; // Create the API URL

                // Make an AJAX request to the Flask endpoint
                fetch(apiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.error) {
                            // Handle the error response
                            alert(`Error: ${data.error}`);
                        } else {
                            // Process the successful response
                            const cleanedOutput = cleanMetasploitResults(data.output); // Use the new cleaning function
                            console.log("Metasploit Search Results:", cleanedOutput); // Display or handle the results as needed

                            // Ensure the element exists before trying to set its innerText
                            const resultsDiv = document.getElementById('msfSearchResults'); // Update to the appropriate div ID
                            if (resultsDiv) {
                                resultsDiv.innerHTML = cleanedOutput; // Display formatted results

                                // Check if any matching modules are present
                                if (cleanedOutput.includes("Found a matching module.")) {
                                    attackPortButton.style.display = 'block'; // Show the button
                                } else {
                                    attackPortButton.style.display = 'none'; // Hide the button
                                }
                            } else {
                                console.error("Results div not found");
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching search results:', error);
                    });
            } else {
                alert('No service version information available to search.');
            }
        });



    } else {
        // Handle case where no data is available
        document.getElementById('portDetails').innerText = "No port information available.";
    }
});




// Function to clean and format the SearchSploit results
function cleanSearchSploitResults(rawOutput) {
    // Remove ANSI color codes, unnecessary whitespace, and specific unwanted lines
    return rawOutput
        .replace(/\x1B\[[0-9;]*m/g, '') // Remove ANSI color codes
        .trim() // Remove leading/trailing whitespace
        .split('\n') // Split by new lines
        .filter(line => line.trim() !== '' && !/^[-]+$/.test(line.trim())) // Keep lines that are not empty and not just dashes
        .map(line => line.replace(/^\s*[-]+\s*/, '')) // Remove leading dashes with spaces
        .map(line => line.trim()) // Trim each line
        .join('<br/>'); // Join lines with <br> for HTML line breaks
}

// Function to clean and format the Metasploit search results
/*function cleanMetasploitResults(rawOutput) {
    // Check if the output contains the section "Matching Modules"
    const matchingModulesStart = rawOutput.indexOf("Matching Modules");
    const matchingModulesEnd = rawOutput.indexOf("Interact with a module by name or index", matchingModulesStart);

    if (matchingModulesStart === -1 || matchingModulesEnd === -1) {
        return "No matching modules found."; // Handle case when the section is not found
    }

    // Extract the matching modules section
    const matchingModulesSection = rawOutput.substring(matchingModulesStart, matchingModulesEnd);

    // Clean and format the extracted section
    return matchingModulesSection
        .replace(/\x1B\[[0-9;]*m/g, '') // Remove ANSI color codes
        .trim() // Remove leading/trailing whitespace
        .split('\n') // Split by new lines
        .filter(line => line.trim() !== '' && !/^[-]+$/.test(line.trim())) // Keep non-empty lines
//        .map(line => line.replace(/^\s*[-]+\s*//*, ''))*/ // Remove leading dashes /*.map(line => line.replace(/^\s*[-]+\s*/, ''))*/
//        .map(line => line.trim()) // Trim each line
//        .join('<br/>'); // Join lines with <br> for HTML line breaks
//}

function cleanMetasploitResults(rawOutput) {
    // Check if the output contains the section "Matching Modules"
    const matchingModulesStart = rawOutput.indexOf("Matching Modules");
    const matchingModulesEnd = rawOutput.indexOf("Interact with a module by name or index", matchingModulesStart);

    // Handle case when the section is not found
    if (matchingModulesStart === -1 || matchingModulesEnd === -1) {
        return "No matching modules found.";
    }

    // Extract the matching modules section
    const matchingModulesSection = rawOutput.substring(matchingModulesStart, matchingModulesEnd);

    // Check if there are any lines that start with a number (indicating a module found)
    const hasMatchingModule = matchingModulesSection.split('\n').some(line => line.trim() !== '' && /^\d+/.test(line.trim()));

    // Return message based on whether matching modules are found
    return hasMatchingModule ? "Found a matching module." : "No matching modules found.";
}

