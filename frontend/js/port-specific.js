const BASE_URL = 'http://192.168.1.24:5000';

window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        window.location.href = "login.html"; // Redirect if not logged in
    } else {
        console.log("Logged in as:", currentUser);
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const portInfo = JSON.parse(sessionStorage.getItem('selectedPortInfo'));

    if (portInfo) {
        document.getElementById('portDetails').innerText = `
            Port: ${portInfo.port}
            Service: ${portInfo.service || 'N/A'}
            CVE ID: ${portInfo.cveId || 'N/A'}
            Version: ${portInfo.version || 'N/A'}
        `;

        const portService = portInfo.service;
        const searchSploitButton = document.getElementById('searchSploitButton');
        const attackPortButton = document.getElementById('attackPortButton');

        if (searchSploitButton) {
            searchSploitButton.addEventListener('click', function() {
                let service = portInfo.service || "N/A";

                if (service === "Samba smbd 3.X - 4.X") {
                    service = "Samba";
                }
                console.log(service);

                if (portService) {
                    const apiUrl = `${BASE_URL}/search_exploit`;
                    const requestData = { name: service };

                    fetch(apiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestData)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.error) {
                                alert(`Error: ${data.error}`);
                            } else {
                                const cleanedOutput = data.output;
                                console.log("Cleaned Search Results:", cleanedOutput);

                                const resultsDiv = document.getElementById('searchSploitResults');
                                if (resultsDiv) {
                                    resultsDiv.innerHTML = cleanedOutput;
                                    attackPortButton.style.display = cleanedOutput.trim() !== "No results found." ? 'block' : 'none';
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
        }
    } else {
        document.getElementById('portDetails').innerText = "No port information available.";
    }
});

