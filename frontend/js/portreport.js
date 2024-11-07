// port-reports.js

$(document).ready(function () {
    // Check if the user is logged in
    const currentUser = sessionStorage.getItem("username");

    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = "login.html";
    } else {
        // Load reports using Firebase Authentication's userID

    }

    // Event delegation for dynamically loaded content
    $('#reportsTable').on('click', '.view-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        window.location.href = `portreport-details.html?reportID=${reportID}`;
    });

    $('#reportsTable').on('click', '.export-btn', function () {
        const reportID = $(this).closest('tr').find('td:first').text();
        exportReportAsJSON(reportID);
    });
});

// Function to load reports for the current user from Firebase
async function loadReports(userID) {
    const tableBody = $('#reportsTable tbody');
    tableBody.empty(); // Clear any existing data

    try {
        // Access the existing Firebase Firestore instance
        const db = firebase.firestore();

        // Query Firestore for documents where the userID matches
        const querySnapshot = await db.collection("scanReports")
            .where("userID", "==", userID)
            .orderBy("date", "desc")
            .get();

        if (querySnapshot.empty) {
            tableBody.append('<tr><td colspan="4">No reports found.</td></tr>');
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newRow = `
                    <tr>
                        <td>${doc.id}</td>
                        <td>${data.title || "Unnamed Report"}</td>
                        <td>${data.date ? data.date.toDate().toLocaleString() : "N/A"}</td>
                        <td>
                            <button class="btn btn-primary view-btn">View Report</button>
                            <button class="btn btn-secondary export-btn">Export as JSON</button>
                        </td>
                    </tr>
                `;
                tableBody.append(newRow);
            });
        }

        // Initialize DataTable after data is loaded
        $('#reportsTable').DataTable({
            "pageLength": 10,
            "lengthMenu": [5, 10, 25, 50],
            "ordering": true,
            "searching": true,
            "responsive": true,
            "destroy": true,  // Destroy any existing table before re-initializing
        });

    } catch (error) {
        console.error("Error loading reports from Firebase:", error);
    }
}

// Function to export the report as JSON
function exportReportAsJSON(reportID) {
    // Access the existing Firebase Firestore instance
    const db = firebase.firestore();

    db.collection("scanReports").doc(reportID).get().then((doc) => {
        if (doc.exists) {
            const reportData = doc.data();

            // Convert report data to JSON and download as a file
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `report_${reportID}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
        } else {
            console.error("No such document!");
            alert("Report not found.");
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
    });
}
