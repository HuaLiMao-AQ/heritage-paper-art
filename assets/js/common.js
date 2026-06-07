import "./components/site-navbar.js";
import "./components/site-footer.js";

let hasInitializedCommonInteractions = false;

function initCommonInteractions() {
    if (hasInitializedCommonInteractions) {
        return;
    }
    hasInitializedCommonInteractions = true;

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
        ".paper-card", ".art-card", ".work-card", ".image-panel", ".cta-center__summary",
    ];

    document.querySelectorAll(revealSelectors.join(", ")).forEach((el) => {
        if (!el.classList.contains("reveal")) {
            el.classList.add("reveal");
        }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.15,
    });

    document.querySelectorAll(".reveal").forEach((el) => {
        revealObserver.observe(el);
    });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
        document.querySelectorAll(".button").forEach((btn) => {
            const radius = 50;
            const maxOffset = 4;

            function magneticMove(e) {
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                    const factor = 1 - dist / radius;
                    const ox = (dx / dist) * maxOffset * factor;
                    const oy = (dy / dist) * maxOffset * factor;
                    btn.style.transform = `translate(${ox}px, ${oy}px)`;
                } else {
                    btn.style.transform = "";
                }
            }

            function magneticLeave() {
                btn.style.transform = "";
            }

            btn.addEventListener("mousemove", magneticMove);
            btn.addEventListener("mouseleave", magneticLeave);
        });

        document.querySelectorAll(".hero-title, .section-title, .page-hero__title").forEach((title) => {
            if (title.querySelector(".text-reveal-line")) return;

            const html = title.innerHTML;
            if (!html.includes("<br")) return;

            const parts = html.split(/<br\s*\/?>/i);
            title.innerHTML = "";
            title.classList.add("text-reveal-wrap");

            parts.forEach((part) => {
                const span = document.createElement("span");
                span.className = "text-reveal-line";
                span.innerHTML = part.trim();
                title.appendChild(span);
            });
        });

        const textRevealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll(".text-reveal-wrap").forEach((el) => {
            textRevealObserver.observe(el);
        });
    }

    const imagePanels = document.querySelectorAll(".image-panel");
    if (imagePanels.length > 0) {
        const imageObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-revealed");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

        imagePanels.forEach((panel) => {
            if (!panel.classList.contains("is-revealed")) {
                imageObserver.observe(panel);
            }
        });
    }

    const lightbox = document.getElementById("gallery-lightbox");
    if (lightbox) {
        const lightboxImg = lightbox.querySelector("img");
        const closeBtn = lightbox.querySelector(".gallery-lightbox__close");

        document.querySelectorAll(".gallery-card img, .papercut-showcase img, .origami-mosaic img").forEach((img) => {
            img.style.cursor = "zoom-in";
            img.addEventListener("click", () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add("is-open");
            });
        });

        const close = () => lightbox.classList.remove("is-open");
        closeBtn.addEventListener("click", close);
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) close();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
        });
    }
}

initCommonInteractions();
