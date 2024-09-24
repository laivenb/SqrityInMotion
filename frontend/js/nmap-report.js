document.addEventListener('DOMContentLoaded', function () {
    const exitButton = document.querySelector('.exit-btn');
    if (exitButton) {
        exitButton.addEventListener('click', function () {
            const confirmation = confirm("Are you sure you want to exit without saving?");
            if (confirmation) {
                window.location.href = 'home.html';
            }

        });
    }

    const downloadButtons = document.querySelectorAll('.blue-download-btn, .gray-download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function () {
            alert("Successfully downloaded");
            window.location.href = 'home.html';
        });
    });

    const saveButton = document.querySelector('.save-btn');
    if (saveButton) {
        saveButton.addEventListener('click', function () {
            alert("Saved Successfully!");
            window.location.href = 'home.html';
        });
    }
});
