const BASE_URL = "http://192.168.1.39:5000"; // Update as needed

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

    // Fetch Port Table
    async function fetchPortTable() {
        const portsRef = ref(database, "port");
        try {
            const snapshot = await get(portsRef);
            if (snapshot.exists()) {
                portTable = snapshot.val();
                console.log("Port Table from Database:", portTable);
            } else {
                console.warn("No port data found in the database.");
            }
        } catch (error) {
            console.error("Error fetching port table:", error);
        }
    }

    await fetchPortTable();
})();

// Get IP from URL
function getIPFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ip') || "Unknown IP";
}

// Redirect if not logged in
window.addEventListener("load", () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);

        // Ensure .ip-address exists before modifying textContent
        const ipAddressElement = document.querySelector('.ip-address');
        if (ipAddressElement) {
            ipAddressElement.textContent = getIPFromURL();
        }
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const portInfo = sessionStorage.getItem("selectedPortInfo");
    const portDetailsElement = document.getElementById("portDetails");
    const searchSploitButton = document.getElementById("searchSploitButton");
    const metasploitButton = document.getElementById("metasploitButton");
    const hydraButton = document.getElementById("hydraButton");
    const resultsDiv = document.getElementById("searchSploitResults");
    const metasploitDiv = document.getElementById("metasploitResults");
    const hydraResultsDiv = document.getElementById("hydraResults");
    const medusaButton = document.getElementById("medusaButton");
    const medusaResultsDiv = document.getElementById("medusaResults");
    const nfsButton = document.getElementById("nfsButton");
    const nfsResultsDiv = document.getElementById("nfsResults");

    if (!portInfo) {
        console.error("No port information found in sessionStorage.");
        return;
    }

    const parsedPortInfo = JSON.parse(portInfo);
    const service = parsedPortInfo.service || "N/A";

    if (portDetailsElement) {
        portDetailsElement.innerHTML = `
            <strong class="pl-2 pr-2">Port:</strong> ${parsedPortInfo.port}<br>
            <strong class="pl-2 pr-2">Service:</strong> ${service}<br>
            <strong class="pl-2 pr-2">CVE ID:</strong> ${parsedPortInfo.cveId || "N/A"}<br>
            <strong class="pl-2 pr-2">Version:</strong> ${parsedPortInfo.version || "N/A"}
        `;
    }
    //  SearchSploit
    if (searchSploitButton) {
        searchSploitButton.addEventListener("click", async function () {
            let serviceName = parsedPortInfo.service || "N/A";

            if (serviceName.includes("Samba smbd")) serviceName = "Samba";
            if (serviceName.includes("GNU Classpath grmiregistry")) serviceName = "java rmi";
            if (serviceName.includes("Metasploitable root shell")) serviceName = "1524";

            console.log("Searching exploits for:", serviceName);

            if (serviceName === "N/A") {
                showModal("No service information available to search.");
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/search_exploit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: serviceName }),
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("API Response:", data);

                if (data.error) {
                    showModal(`Error: ${data.error}`);
                    return;
                }

                let cleanedArray = Array.isArray(data.output)
                    ? data.output.map(item =>
                        typeof item === "string"
                            ? item.replace(/\u001b\[[0-9;]*m/g, '').replace(/[^\x20-\x7E\n]/g, "").trim()
                            : item
                    ).filter(item => item !== "")
                    : [];

                resultsDiv.innerHTML = `<pre>${cleanedArray.join("\n")}</pre>`;

            } catch (error) {
                console.error("Error fetching search results:", error);
                showModal("Failed to retrieve exploit data. Please try again later.");
            }
        });
    }

    //  Metasploit
    if (metasploitButton) {
        metasploitButton.addEventListener("click", function () {
            console.log("Metasploit button clicked");

            const portNumber = parsedPortInfo.port;
            const portDetails = portTable[portNumber];

            if (!portDetails || !portDetails.description) {
                metasploitDiv.innerHTML = `<pre>No attack details available for port ${portNumber}</pre>`;
                return;
            }

            metasploitDiv.innerHTML = `<pre>${portDetails.description}</pre>`;
        });
    }

    // Hydra (Credential Download)
    if (hydraButton) {
        hydraButton.addEventListener("click", function () {
            console.log("Hydra button clicked");

            // Append the Hydra instructions first
            hydraResultsDiv.innerHTML = `
            <h2>Instructions for Using Hydra with Text Files</h2>

            <h3>1. Import Files to Kali Linux</h3>
            <p>After obtaining the text files, transfer them to your Kali Linux virtual machine.</p>
            <ol>
              <li>Open your Kali Linux VM.</li>
              <li>Drag the text files to your Kali Desktop.</li>
            </ol>

            <h3>2. Use Hydra to Brute Force SSH (Port 22)</h3>
            <p>Open your Kali terminal and use the following command to brute force:</p>

            <h4>For SSH Login (Port 22)</h4>
            <pre><code>
            hydra -L ~/Desktop/users.txt -P ~/Desktop/passwords.txt -t 4 ssh://&lt;target-IP&gt;
</code></pre>

            <p>Replace <code>&lt;target-IP&gt;</code> with the actual IP address of the target.</p>
            <p>The <code>-t 4</code> flag sets the number of parallel tasks.</p>

            <h3>3. Verify Results</h3>
            <p>Once Hydra completes the attack, it will display valid login credentials if successful.</p>
            <br>
            <strong>Download Credentials:</strong><br>
        `;

            // Append download links after instructions
            const files = [
                "Credentials/Android/common_android_passwords.txt",
                "Credentials/Android/common_android_usernames.txt",
                "Credentials/Cisco/common_cisco_passwords.txt",
                "Credentials/Cisco/common_cisco_usernames.txt",
                "Credentials/IOS/common_ios_passwords.txt",
                "Credentials/IOS/common_ios_usernames.txt",
                "Credentials/SSH/common_ssh_passwords.txt",
                "Credentials/SSH/common_ssh_usernames.txt",
                "Credentials/Windows/common_windows_passwords.txt",
                "Credentials/Windows/common_windows_usernames.txt"
            ];

            files.forEach(file => {
                const fileName = file.split("/").pop();
                const link = document.createElement("a");
                link.href = file;
                link.download = fileName;
                link.textContent = fileName;
                link.style.display = "block";
                hydraResultsDiv.appendChild(link);
            });
        });
    }




    // Medusa (Credential Download)
    if (medusaButton) {
        medusaButton.addEventListener("click", function () {
            console.log("Medusa button clicked");

            // Clear any previous content
            medusaResultsDiv.innerHTML = "";

            // Add instructions
            medusaResultsDiv.innerHTML += `
        <h2>Instructions for Using Medusa with Text Files</h2>

        <h3>1. Import Files to Kali Linux</h3>
        <p>After obtaining the text files, transfer them to your Kali Linux virtual machine.</p>
        <ol>
          <li>Open your Kali Linux VM.</li>
          <li>Drag the text files to your Kali Desktop.</li>
        </ol>

        <h3>2. Use Medusa to Brute Force</h3>
        <p>Open your Kali terminal and use the following command to brute force:</p>

        <h4>SSH Login</h4>
        <pre><code>medusa -h &lt;target-IP&gt; -U ~/Desktop/users.txt -P ~/Desktop/passwords.txt -M ssh</code></pre>

        <h4>FTP Login</h4>
        <pre><code>medusa -h &lt;target-IP&gt; -U ~/Desktop/users.txt -P ~/Desktop/passwords.txt -M ftp</code></pre>

        <h4>Postgres Login</h4>
        <pre><code>medusa -h &lt;target-IP&gt; -U ~/Desktop/users.txt -P ~/Desktop/passwords.txt -M postgres</code></pre>

        <p><strong>Note:</strong> Replace <code>&lt;target-IP&gt;</code> with the actual IP address of the target.</p>

        <h3>3. Download Credential Files</h3>
      `;

            // Add download links
            const files2 = [
                "Credentials/Android/common_android_passwords.txt",
                "Credentials/Android/common_android_usernames.txt",
                "Credentials/Cisco/common_cisco_passwords.txt",
                "Credentials/Cisco/common_cisco_usernames.txt",
                "Credentials/IOS/common_ios_passwords.txt",
                "Credentials/IOS/common_ios_usernames.txt",
                "Credentials/SSH/common_ssh_passwords.txt",
                "Credentials/SSH/common_ssh_usernames.txt",
                "Credentials/Windows/common_windows_passwords.txt",
                "Credentials/Windows/common_windows_usernames.txt"
            ];

            files2.forEach(file3 => {
                const fileName = file3.split("/").pop();
                const link = document.createElement("a");
                link.href = file3;
                link.download = fileName;
                link.textContent = fileName;
                link.style.display = "block";
                medusaResultsDiv.appendChild(link);
            });
        });
    }


    if (nfsButton) {
        nfsButton.addEventListener("click", function () {
            console.log("NFS button clicked");

            const portNumber = parsedPortInfo.port;
            const portDetails = portTable[portNumber];

            if (!portDetails || !portDetails.description) {
                nfsResultsDiv.innerHTML = `<pre>No attack details available for port ${portNumber}</pre>`;
                return;
            }

            nfsResultsDiv.innerHTML = `<pre>${portDetails.description}</pre>`;
        });
    }


});

function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
}

// Hide the modal
function hideModal() {
    document.getElementById('alertModal').style.display = 'none';
}

// Close (X) button event
document.getElementById('closeModalBtn').addEventListener('click', hideModal);


