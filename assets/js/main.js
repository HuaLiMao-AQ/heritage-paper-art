document.addEventListener("DOMContentLoaded", () => {
    // Smooth scroll for anchor links
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

    // Auto-add reveal classes to common elements for animation
    const revealSelectors = [
        ".section-header", ".hero-title", ".hero-text", ".hero-actions", 
        ".paper-card", ".art-card", ".work-card", ".image-panel", ".cta-center__summary"
    ];
    
    document.querySelectorAll(revealSelectors.join(", ")).forEach((el, index) => {
        if (!el.classList.contains("reveal")) {
            el.classList.add("reveal");
            // Optionally add staggered delays based on position if they are siblings
            // For simplicity, we just add the base class.
        }
    });

    // Reveal animations on scroll
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before it comes into view
        threshold: 0.1
    });

    document.querySelectorAll(".reveal").forEach(el => {
        revealObserver.observe(el);
    });
});
