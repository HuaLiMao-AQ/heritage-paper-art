document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-scroll-target]").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            const selector = trigger.getAttribute("data-scroll-target");
            if (!selector) return;
            const target = document.querySelector(selector);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
});
