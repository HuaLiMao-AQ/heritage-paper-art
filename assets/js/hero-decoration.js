document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector(".hero-decoration-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    function getAccentColor() {
        return (
            getComputedStyle(document.documentElement)
                .getPropertyValue("--color-accent")
                .trim() || "#b91c1c"
        );
    }

    function drawOrigamiFolds(w, h) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.lineTo(w, h * 0.35);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const grad1 = ctx.createLinearGradient(0, h * 0.35, 0, h);
        grad1.addColorStop(0, "rgba(0, 0, 0, 0.04)");
        grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad1;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.lineTo(w, h * 0.35);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, h * 0.05);
        ctx.lineTo(w * 0.55, h * 0.45);
        ctx.lineTo(0, h * 0.65);
        ctx.closePath();

        const grad2 = ctx.createLinearGradient(0, h * 0.05, w * 0.55, h * 0.45);
        grad2.addColorStop(0, "rgba(255, 255, 255, 0.5)");
        grad2.addColorStop(1, "rgba(0, 0, 0, 0.02)");

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.05)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = grad2;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(0, h * 0.05);
        ctx.lineTo(w * 0.55, h * 0.45);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawPaperCut(cx, cy, R, color) {
        ctx.save();

        ctx.shadowColor = "rgba(185, 28, 28, 0.25)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 8;

        ctx.fillStyle = color;
        ctx.strokeStyle = color;


        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.lineWidth = R * 0.06;
        ctx.stroke();


        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.72, 0, Math.PI * 2);
        ctx.lineWidth = R * 0.03;
        ctx.stroke();


        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2);
        ctx.fill();

        const petals = 8;
        for (let i = 0; i < petals; i++) {
            const angle = (Math.PI * 2 * i) / petals;

            ctx.save();
            ctx.translate(
                cx + Math.cos(angle) * (R * 0.47),
                cy + Math.sin(angle) * (R * 0.47)
            );
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, R * 0.18, R * 0.07, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * (R * 0.72), cy + Math.sin(angle) * (R * 0.72));
            ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
            ctx.lineWidth = R * 0.04;
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawPaperScrap(x, y, size, angle, color) {
        ctx.save();

        ctx.shadowColor = "rgba(185, 28, 28, 0.15)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function drawScene(ox = 0, oy = 0) {
        const hero = canvas.closest(".hero");
        if (!hero) return;

        const dpr = window.devicePixelRatio || 1;
        const w = hero.offsetWidth;
        const h = hero.offsetHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const color = getAccentColor();
        const scale = Math.min(w, h);

        ctx.save();
        ctx.translate(ox * 8, oy * 8);
        drawOrigamiFolds(w, h);
        ctx.restore();

        ctx.save();
        ctx.translate(ox * 20, oy * 20);
        drawPaperCut(w * 0.75, h * 0.22, scale * 0.24, color);
        ctx.restore();

        ctx.save();
        ctx.translate(ox * 40, oy * 40);
        drawPaperScrap(w * 0.15, h * 0.18, scale * 0.02, Math.PI / 6, color);
        drawPaperScrap(w * 0.85, h * 0.55, scale * 0.015, -Math.PI / 8, color);
        drawPaperScrap(w * 0.45, h * 0.65, scale * 0.012, Math.PI / 4, color);
        ctx.restore();
    }

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isHeroVisible = true;
    let isAnimating = false;

    function updateTarget(clientX, clientY) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (clientX - cx) / cx;
        targetY = (clientY - cy) / cy;
    }

    document.addEventListener("mousemove", (e) => {
        if (!isHeroVisible) return;
        updateTarget(e.clientX, e.clientY);
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animate);
        }
    });

    document.addEventListener("touchmove", (e) => {
        if (!isHeroVisible) return;
        updateTarget(e.touches[0].clientX, e.touches[0].clientY);
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animate);
        }
    }, { passive: true });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible && !isAnimating) {
                isAnimating = true;
                requestAnimationFrame(animate);
            }
        });
    });
    
    const heroSection = canvas.closest(".hero");
    if (heroSection) {
        observer.observe(heroSection);
    }

    function animate() {
        if (!isHeroVisible) {
            isAnimating = false;
            return;
        }

        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        drawScene(currentX, currentY);

        if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
        }
    }

    drawScene(0, 0);

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => drawScene(currentX, currentY), 100);
    });
});