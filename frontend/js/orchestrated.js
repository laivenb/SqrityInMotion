document.querySelectorAll('.tool button').forEach((button, index) => {
    button.addEventListener('click', () => {
        let toolPage = '';

        switch (index) {
            case 0:
                toolPage = 'medusa.html';
                break;
            case 1:
                toolPage = 'john-r.html';
                break;
            case 2:
                toolPage = 'metasploit.html';
                break;
            case 3:
                toolPage = 'hydra.html';
                break;
        }

        if (toolPage) {
            window.location.href = toolPage;
        }
    });
});
