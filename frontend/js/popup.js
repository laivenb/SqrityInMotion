// Function to show the modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
}

// Function to close the modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}


document.getElementById('defaultCredentialsBtn').addEventListener("click", function () {
    const success = Math.random() > 0.5; // for testing i make it 50/50 

    if (success) {
        showModal('successModal');
    } else {
        showModal('errorModal');
    }
});

document.getElementById('configuredCredentialsBtn').addEventListener("click", function () {
    showModal('configuredModal');
});

document.getElementById('credentialsForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const success = Math.random() > 0.5;

    if (success) {

        showModal('successModal');
    } else {

        showModal('errorModal');
    }


    closeModal('configuredModal');
});
