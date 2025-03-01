const BASE_URL = "http://192.168.68.63:5000";

let portTable = {}; // Declare globally so it's accessible

(async () => {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js");
    const { getDatabase, ref, get } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js");

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAGRcp5vGb3jkEHQRLqpteltbjKalDYb00",
        authDomain: "sqrity-f02ee.firebaseapp.com",
        projectId: "sqrity-f02ee",
        storageBucket: "sqrity-f02ee.appspot.com",
        messagingSenderId: "299895044214",
        appId: "1:299895044214:web:b9da099b6067dfb8974757",
        databaseURL: "https://sqrity-f02ee-default-rtdb.asia-southeast1.firebasedatabase.app"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    console.log("Firebase initialized.");

    // Function to get service details (type and attack)
    async function fetchPortTable() {
        const portsRef = ref(database, "port");
        try {
            const snapshot = await get(portsRef);
            if (snapshot.exists()) {
                portTable = snapshot.val(); // Store globally
                console.log("Port Table from Database:", portTable);
            } else {
                console.warn("No port data found in the database.");
            }
        } catch (error) {
            console.error("Error fetching port table:", error);
        }
    }

    // Fetch the port table before continuing
    await fetchPortTable();
})();

// Function to get IP from URL
function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ip') || "Unknown IP";
}

// Redirect if user is not logged in
window.addEventListener("load", () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);

        const ipAddress = getIPFromURL();
        const ipAddressElement = document.querySelector('.ip-address');

        if (ipAddressElement) {
            ipAddressElement.textContent = ipAddress;
            console.log("IP Address:", ipAddress);
        }
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const portInfo = sessionStorage.getItem("selectedPortInfo");
    const portDetailsElement = document.getElementById("portDetails");
    const searchSploitButton = document.getElementById("searchSploitButton");
    const metasploitButton = document.getElementById("metasploitButton");
    const resultsDiv = document.getElementById("searchSploitResults");
    const metasploitDiv = document.getElementById("metasploitResults");

    if (!portInfo) {
        console.error("No port information found in sessionStorage.");
        return;
    }

    const parsedPortInfo = JSON.parse(portInfo);
    const service = parsedPortInfo.service || "N/A";

    if (portDetailsElement) {
        portDetailsElement.innerHTML = `
            <strong>Port:</strong> ${parsedPortInfo.port}<br>
            <strong>Service:</strong> ${service}<br>
            <strong>CVE ID:</strong> ${parsedPortInfo.cveId || "N/A"}<br>
            <strong>Version:</strong> ${parsedPortInfo.version || "N/A"}
        `;
    }

    // SearchSploit event listener
    if (searchSploitButton) {
        searchSploitButton.addEventListener("click", async function () {
            let serviceName = parsedPortInfo.service || "N/A";

            if (serviceName.includes("Samba smbd")) {
                serviceName = "Samba";
            }

            console.log("Searching exploits for:", serviceName);

            if (serviceName === "N/A") {
                alert("No service information available to search.");
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/search_exploit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: serviceName }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("API Response:", data);

                if (data.error) {
                    alert(`Error: ${data.error}`);
                    return;
                }

                let cleanedArray = Array.isArray(data.output)
                    ? data.output.map(item =>
                        typeof item === "string"
                            ? item.replace(/\u001b\[[0-9;]*m/g, '').replace(/[^\x20-\x7E\n]/g, "").trim()
                            : item
                    ).filter(item => item !== "")
                    : [];

                console.log("Cleaned Exploit Results:", cleanedArray);

                if (resultsDiv) {
                    resultsDiv.innerHTML = `<pre>${cleanedArray.join("\n")}</pre>`;
                } else {
                    console.error("Results div not found.");
                }

            } catch (error) {
                console.error("Error fetching search results:", error);
                alert("Failed to retrieve exploit data. Please try again later.");
            }
        });
    } else {
        console.error("SearchSploit button not found.");
    }

    // Metasploit button event listener
    if (metasploitButton) {
        metasploitButton.addEventListener("click", function () {
            console.log("Metasploit button clicked");

            if (!parsedPortInfo.port || parsedPortInfo.port === "N/A") {
                alert("No port information available.");
                return;
            }

            const portNumber = parsedPortInfo.port;
            const portDetails = portTable[portNumber];

            if (!portDetails || !portDetails.description) {
                console.error(`No attack details found for port ${portNumber}`);
                metasploitDiv.innerHTML = `<pre>No attack details available for port ${portNumber}</pre>`;
                return;
            }

            console.log(`Metasploit Attack Data for Port ${portNumber}:`, portDetails.description);

            // Function to format Metasploit output for IT professionals
            function formatMetasploitDescription(text) {
                return text
                    // Format section headers (h2 for main, h3 for sub)
                    .replace(/^(Overview|Example Exploit|Step-by-Step Guide):/gm, "<h2>$1:</h2>")
                    .replace(/^(Start Metasploit|Search for the Exploit|Select the Exploit|Set Target Options|Check the Payload|Run the Exploit|Shell Access|Useful Commands):/gm, "<h3>$1:</h3>")

                    // Remove extra spaces after new lines
                    .replace(/\n\s+/g, "\n")

                    // Convert new lines to paragraph breaks only when not inside code blocks
                    .replace(/\n(?!<\/?pre>)/g, "<br>")

                    // Highlight commands inside <pre> blocks with proper styling
                    .replace(/(sudo msfconsole|search vsftpd|use exploit\/[\w\/]+|set RHOSTS [^<]+|set LHOST [^<]+|'exploit'|show options|exit|nmap -p \d+ [^<]+)/g,
                        "<pre style='font-size: 18px; background: #3333FF; color: #0c0c0c; padding: 8px; border-radius: 5px;'>$1</pre>")

                    // Ensure strong (bold) formatting for important labels
                    .replace(/(\bRHOSTS\b|\bLHOST\b)/g, "<strong>$1</strong>");
            }



            // Apply formatting to description
            const formattedDescription = formatMetasploitDescription(portDetails.description);

            // Display formatted output in metasploitDiv
            metasploitDiv.innerHTML = `<pre>${formattedDescription}</pre>`;
        });
    } else {
        console.error("Metasploit button not found.");
    }

});
