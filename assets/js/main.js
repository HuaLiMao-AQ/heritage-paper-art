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

    const revealSelectors = [
        ".section-header", ".hero-title", ".hero-text", ".hero-actions", 
        ".paper-card", ".art-card", ".work-card", ".image-panel", ".cta-center__summary"
    ];
    
    document.querySelectorAll(revealSelectors.join(", ")).forEach((el, index) => {
        if (!el.classList.contains("reveal")) {
            el.classList.add("reveal");
        }
        }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.1
    });

    document.querySelectorAll(".reveal").forEach(el => {
        revealObserver.observe(el);
    });

const lightbox = document.getElementById("gallery-lightbox");
if (lightbox) {
    const lightboxImg = lightbox.querySelector("img");
    const closeBtn = lightbox.querySelector(".gallery-lightbox__close");
    
    document.querySelectorAll(".gallery-card img, .papercut-showcase img, .origami-mosaic img").forEach(img => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add("is-open");
        });
    });
    
    const close = () => lightbox.classList.remove("is-open");
    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
}
});
