import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, set, push, child, get, query, orderByChild, orderByKey, equalTo, limitToLast } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

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

window.addEventListener('load', () => {
    const currentUser = sessionStorage.getItem("username");
    console.log("from CVE Report" + currentUser);

    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        console.log("Logged in as:", currentUser);

    }
});


document.getElementById('saveCveReportBtn').addEventListener('click', async () => {
    await uploadCveReportToFirebase();
});


export async function uploadCveReportToFirebase(cveReport) {
    // Validate if the cveReport is not empty
    if (!cveReport || cveReport.length === 0) {
        console.error("Error: CVE report data is empty.");
        alert("No CVE data available to save.");
        return;
    }

    const tempUser = sessionStorage.getItem("username");
    const userID = tempUser;  // Get the current user's ID (Foreign Key)
    const dateCreated = new Date().toISOString();  // Current date and time
    const reportName = `Test CVE Report for ${ipAddress}`; // Report name

    // Generate a custom report ID for the new CVE report
    const reportID = await generateCustomCveReportId();

    // Reference to the specific CVE report using the custom reportID
    const cveReportRef = ref(database, `cveReports/${reportID}`);

    // Set the data for the new CVE report in Firebase
    set(cveReportRef, {
        userID: userID,  // Foreign Key: User ID
        reportName: reportName,
        cves: cveReport,  // Array of CVEs
        dateCreated: dateCreated
    })
        .then(() => {
            console.log("CVE Report uploaded successfully!");
            alert("CVE Report saved successfully!");
        })
        .catch((error) => {
            console.error("Error uploading CVE report:", error);
        });
}




async function generateCustomCveReportId() {
    // Prefix for the CVE report ID
    const prefix = 'CVE';

    // Query to find the last CVE report ID in the cveReports node
    const cveReportQuery = query(ref(database, "cveReports"), orderByKey(), limitToLast(1));
    const snapshot = await get(cveReportQuery);

    let increment = 1;  // Start from 1 if there are no previous records

    if (snapshot.exists()) {
        const lastCveReportId = Object.keys(snapshot.val())[0];
        const lastIncrement = lastCveReportId.split('_')[0].slice(-4);
        increment = parseInt(lastIncrement, 10) + 1;
    }

    const incrementedPart = String(increment).padStart(4, '0');
    const key = generateRandomKey();

    return `${prefix}${incrementedPart}_${key}`;
}


function generateRandomKey() {
    return Math.random().toString(36).substring(2, 15);
}