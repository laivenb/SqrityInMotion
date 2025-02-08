document.addEventListener("DOMContentLoaded", function () {
    let accordionButtons = document.querySelectorAll(".accordion-button");

    accordionButtons.forEach(button => {
        button.addEventListener("click", function () {
            let targetId = this.getAttribute("data-bs-target");
            let targetCollapse = document.querySelector(targetId);

            // Toggle the clicked accordion only
            if (targetCollapse.classList.contains("show")) {
                targetCollapse.classList.remove("show");
                this.setAttribute("aria-expanded", "false");
            } else {
                targetCollapse.classList.add("show");
                this.setAttribute("aria-expanded", "true");
            }
        });
    });
});
