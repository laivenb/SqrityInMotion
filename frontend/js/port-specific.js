const BASE_URL = "http://192.168.1.48:5000";

(async () => {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js");
    const { getDatabase, ref, get } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js");

    const firebaseConfig = {
        apiKey: "AIzaSyAGRcp5vGb3jkEHQRLqpteltbjKalDYb00",
        authDomain: "sqrity-f02ee.firebaseapp.com",
        projectId: "sqrity-f02ee",
        storageBucket: "sqrity-f02ee.appspot.com",
        messagingSenderId: "299895044214",
        appId: "1:299895044214:web:b9da099b6067dfb8974757",
        databaseURL: "https://sqrity-f02ee-default-rtdb.asia-southeast1.firebasedatabase.app"
    };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    console.log("Firebase initialized.");
})();

window.addEventListener("load", async () => {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }
    console.log("Logged in as:", currentUser);

    const portInfo = sessionStorage.getItem("selectedPortInfo");
    const portDetailsElement = document.getElementById("portDetails");
    const searchSploitButton = document.getElementById("searchSploitButton");
    const resultsDiv = document.getElementById("searchSploitResults");

    if (!portInfo) {
        console.error("No port information found in sessionStorage.");
        return;
    }

    const parsedPortInfo = JSON.parse(portInfo);
    const portNumber = parsedPortInfo.port;
    const service = parsedPortInfo.service || "N/A";

    async function getPortData(port) {
        const portsRef = ref(database, "ports");
        try {
            const snapshot = await get(portsRef);
            if (snapshot.exists()) {
                const retrievedData = snapshot.val();
                console.log("Retrieved data from database:", retrievedData);
                for (let key in retrievedData) {
                    if (retrievedData[key].port == port) {
                        console.log("Matching port found in database:", retrievedData[key]);
                        return retrievedData[key];
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching port data:", error);
        }
        return null;
    }

    const portData = await getPortData(portNumber);
    if (portData && portDetailsElement) {
        portDetailsElement.innerHTML = `
            <strong>Port:</strong> ${portData.port}<br>
            <strong>Service:</strong> ${portData.sname || "N/A"}<br>
            <strong>Type:</strong> ${portData.type || "N/A"}<br>
            <strong>Attack:</strong> ${portData.attack || "No attack data found."}<br>
        `;
    }

    if (!searchSploitButton) {
        console.error("SearchSploit button not found.");
        return;
    }

    searchSploitButton.addEventListener("click", async function () {
        let serviceName = service;

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

            console.log("Cleaned Array:", cleanedArray);

            if (resultsDiv) {
                resultsDiv.innerText = cleanedArray.join("\n");
            } else {
                console.error("Results div not found.");
            }

        } catch (error) {
            console.error("Error fetching search results:", error);
            alert("Failed to retrieve exploit data. Please try again later.");
        }
    });
});
