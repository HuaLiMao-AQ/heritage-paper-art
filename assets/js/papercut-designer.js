(function () {
    const canvas = document.getElementById("papercut-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const state = {
        foldMode: 4,
        strokes: [],
        templates: [],
        currentStroke: null,
        paperColor: "#b91c1c",
        tool: "scissors",
        strokeWidth: 3,
        isDrawing: false,
        isUnfolded: false,
        activeTemplate: null,
    };

    const SIZE = 560;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const RADIUS = 250;

    canvas.width = SIZE;
    canvas.height = SIZE;

    function sectorAngle() {
        return (Math.PI * 2) / state.foldMode;
    }

    function isInSector(x, y) {
        const dx = x - CX;
        const dy = y - CY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > RADIUS) return false;
        const angle = Math.atan2(dy, dx);
        const halfAngle = sectorAngle() / 2;
        let a = angle + halfAngle;
        while (a < 0) a += Math.PI * 2;
        while (a >= Math.PI * 2) a -= Math.PI * 2;
        return a <= sectorAngle();
    }

    function clampToSector(x, y) {
        const dx = x - CX;
        const dy = y - CY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const half = sectorAngle() / 2;
        let clampedAngle = Math.max(-half, Math.min(half, angle));
        return {
            x: CX + Math.cos(clampedAngle) * Math.min(dist, RADIUS),
            y: CY + Math.sin(clampedAngle) * Math.min(dist, RADIUS),
        };
    }

    function clearSector() {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, RADIUS + 2, -sectorAngle() / 2, sectorAngle() / 2);
        ctx.closePath();
        ctx.clip();
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.restore();
    }

    function drawPaper() {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, RADIUS, -sectorAngle() / 2, sectorAngle() / 2);
        ctx.closePath();
        ctx.fillStyle = state.paperColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        for (let i = 0; i < state.foldMode; i++) {
            const a = -sectorAngle() / 2 + i * sectorAngle();
            ctx.moveTo(CX, CY);
            ctx.lineTo(CX + Math.cos(a) * RADIUS, CY + Math.sin(a) * RADIUS);
        }
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    function drawStroke(stroke) {
        if (!stroke.points || stroke.points.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, RADIUS, -sectorAngle() / 2, sectorAngle() / 2);
        ctx.closePath();
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = stroke.width || state.strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (state.tool === "eraser" || stroke.erase) {
            ctx.globalCompositeOperation = "destination-out";
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
    }

    function drawTemplate(tpl) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, RADIUS, -sectorAngle() / 2, sectorAngle() / 2);
        ctx.closePath();
        ctx.clip();

        const s = tpl.scale || 20;
        const x = tpl.x;
        const y = tpl.y;

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        switch (tpl.type) {
        case "moon":
            ctx.beginPath();
            ctx.arc(x, y - s * 0.3, s * 0.6, 0, Math.PI);
            ctx.stroke();
            break;
        case "sawtooth":
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const px = x - s + i * s * 0.5;
                ctx.moveTo(px, y - s * 0.4);
                ctx.lineTo(px + s * 0.25, y + s * 0.4);
                ctx.lineTo(px + s * 0.5, y - s * 0.4);
            }
            ctx.stroke();
            break;
        case "dot":
            ctx.beginPath();
            ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            break;
        case "leaf":
            ctx.beginPath();
            ctx.ellipse(x, y, s * 0.15, s * 0.6, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case "cloud":
            ctx.beginPath();
            ctx.arc(x - s * 0.3, y, s * 0.35, Math.PI, 0);
            ctx.arc(x, y - s * 0.2, s * 0.3, Math.PI, 0);
            ctx.arc(x + s * 0.3, y, s * 0.35, Math.PI, 0);
            ctx.stroke();
            break;
        case "coin":
            ctx.beginPath();
            ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.rect(x - s * 0.2, y - s * 0.2, s * 0.4, s * 0.4);
            ctx.stroke();
            break;
        case "plum":
            for (let i = 0; i < 5; i++) {
                const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                ctx.beginPath();
                ctx.arc(x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4, s * 0.25, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(x, y, s * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            break;
        case "butterfly":
            ctx.beginPath();
            ctx.moveTo(x, y - s * 0.5);
            ctx.bezierCurveTo(x - s * 0.8, y - s * 0.7, x - s * 0.9, y + s * 0.1, x, y + s * 0.2);
            ctx.moveTo(x, y - s * 0.5);
            ctx.bezierCurveTo(x + s * 0.8, y - s * 0.7, x + s * 0.9, y + s * 0.1, x, y + s * 0.2);
            ctx.stroke();
            break;
        }
        ctx.restore();
    }

    function drawMirrorPreview() {
        if (state.strokes.length === 0 && state.templates.length === 0 && !state.currentStroke) return;
        ctx.save();
        ctx.globalAlpha = 0.18;
        for (let i = 1; i < state.foldMode; i++) {
            ctx.save();
            ctx.translate(CX, CY);
            ctx.rotate(i * sectorAngle());
            ctx.translate(-CX, -CY);
            state.strokes.forEach(drawStroke);
            state.templates.forEach(drawTemplate);
            if (state.currentStroke) drawStroke(state.currentStroke);
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function render() {
        ctx.clearRect(0, 0, SIZE, SIZE);
        drawPaper();
        state.templates.forEach(drawTemplate);
        state.strokes.forEach(drawStroke);
        if (state.currentStroke) drawStroke(state.currentStroke);
        drawMirrorPreview();
    }

    function renderUnfold() {
        const overlay = document.getElementById("unfold-overlay");
        const unfoldCanvas = document.getElementById("unfold-canvas");
        const uctx = unfoldCanvas.getContext("2d");

        unfoldCanvas.width = 800;
        unfoldCanvas.height = 800;
        const ucx = 400;
        const ucy = 400;
        const uR = 360;

        uctx.clearRect(0, 0, 800, 800);
        uctx.fillStyle = state.paperColor;
        uctx.beginPath();
        uctx.arc(ucx, ucy, uR, 0, Math.PI * 2);
        uctx.fill();
        uctx.strokeStyle = "rgba(0,0,0,0.15)";
        uctx.lineWidth = 1;
        uctx.stroke();

        const scale = uR / RADIUS;
        const drawUnfoldStroke = (stroke) => {
            if (!stroke.points || stroke.points.length < 2) return;
            for (let i = 0; i < state.foldMode; i++) {
                uctx.save();
                uctx.translate(ucx, ucy);
                uctx.rotate(i * sectorAngle());
                uctx.translate(-ucx, -ucy);
                uctx.beginPath();
                const p0 = stroke.points[0];
                uctx.moveTo(ucx + (p0.x - CX) * scale, ucy + (p0.y - CY) * scale);
                for (let j = 1; j < stroke.points.length; j++) {
                    const p = stroke.points[j];
                    uctx.lineTo(ucx + (p.x - CX) * scale, ucy + (p.y - CY) * scale);
                }
                uctx.strokeStyle = "#fff";
                uctx.lineWidth = (stroke.width || state.strokeWidth) * scale;
                uctx.lineCap = "round";
                uctx.lineJoin = "round";
                uctx.stroke();
                uctx.restore();
            }
        };

        state.strokes.forEach(drawUnfoldStroke);
        if (state.currentStroke) drawUnfoldStroke(state.currentStroke);

        overlay.classList.add("is-open");
    }

    canvas.addEventListener("mousedown", (e) => {
        if (state.isUnfolded) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = SIZE / rect.width;
        const scaleY = SIZE / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (state.activeTemplate) {
            if (isInSector(x, y)) {
                state.templates.push({
                    type: state.activeTemplate,
                    x,
                    y,
                    scale: 25,
                });
                render();
            }
            state.activeTemplate = null;
            document.getElementById("template-grid")
                .querySelectorAll(".template-chip")
                .forEach((c) => c.classList.remove("is-active"));
            canvas.style.cursor = state.tool === "eraser" ? "cell" : "crosshair";
            return;
        }

        if (!isInSector(x, y)) return;

        state.isDrawing = true;
        const clamped = clampToSector(x, y);
        state.currentStroke = {
            points: [{ x: clamped.x, y: clamped.y }],
            width: state.strokeWidth,
            erase: state.tool === "eraser",
        };
        render();
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!state.isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = SIZE / rect.width;
        const scaleY = SIZE / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const clamped = clampToSector(x, y);
        state.currentStroke.points.push({ x: clamped.x, y: clamped.y });
        render();
    });

    canvas.addEventListener("mouseup", () => {
        if (!state.isDrawing) return;
        state.isDrawing = false;
        if (state.currentStroke && state.currentStroke.points.length > 1) {
            state.strokes.push(state.currentStroke);
        }
        state.currentStroke = null;
        render();
    });

    canvas.addEventListener("mouseleave", () => {
        if (state.isDrawing) {
            state.isDrawing = false;
            if (state.currentStroke && state.currentStroke.points.length > 1) {
                state.strokes.push(state.currentStroke);
            }
            state.currentStroke = null;
            render();
        }
    });

    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (state.isUnfolded) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = SIZE / rect.width;
        const scaleY = SIZE / rect.height;
        const t = e.touches[0];
        const x = (t.clientX - rect.left) * scaleX;
        const y = (t.clientY - rect.top) * scaleY;

        if (state.activeTemplate) {
            if (isInSector(x, y)) {
                state.templates.push({ type: state.activeTemplate, x, y, scale: 25 });
                render();
            }
            state.activeTemplate = null;
            document.getElementById("template-grid")
                .querySelectorAll(".template-chip")
                .forEach((c) => c.classList.remove("is-active"));
            return;
        }

        if (!isInSector(x, y)) return;
        state.isDrawing = true;
        const clamped = clampToSector(x, y);
        state.currentStroke = {
            points: [{ x: clamped.x, y: clamped.y }],
            width: state.strokeWidth,
            erase: state.tool === "eraser",
        };
        render();
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (!state.isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = SIZE / rect.width;
        const scaleY = SIZE / rect.height;
        const t = e.touches[0];
        const clamped = clampToSector(
            (t.clientX - rect.left) * scaleX,
            (t.clientY - rect.top) * scaleY,
        );
        state.currentStroke.points.push({ x: clamped.x, y: clamped.y });
        render();
    }, { passive: false });

    canvas.addEventListener("touchend", () => {
        if (!state.isDrawing) return;
        state.isDrawing = false;
        if (state.currentStroke && state.currentStroke.points.length > 1) {
            state.strokes.push(state.currentStroke);
        }
        state.currentStroke = null;
        render();
    });

    document.getElementById("fold-options").addEventListener("click", (e) => {
        const btn = e.target.closest(".fold-btn");
        if (!btn) return;
        const fold = parseInt(btn.dataset.fold);
        document.querySelectorAll(".fold-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.foldMode = fold;
        state.strokes = [];
        state.templates = [];
        state.currentStroke = null;
        render();
    });

    document.getElementById("tool-options").addEventListener("click", (e) => {
        const btn = e.target.closest(".tool-btn");
        if (!btn) return;
        document.querySelectorAll(".tool-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.tool = btn.dataset.tool;
        state.activeTemplate = null;
        document.getElementById("template-grid")
            .querySelectorAll(".template-chip")
            .forEach((c) => c.classList.remove("is-active"));
        canvas.style.cursor = state.tool === "eraser" ? "cell" : "crosshair";
    });

    document.getElementById("stroke-width").addEventListener("input", (e) => {
        state.strokeWidth = parseInt(e.target.value);
        const valEl = document.getElementById("stroke-width-val");
        if (valEl) valEl.textContent = e.target.value;
    });

    document.getElementById("btn-undo").addEventListener("click", () => {
        state.strokes.pop();
        state.templates.pop();
        render();
    });

    document.getElementById("btn-clear").addEventListener("click", () => {
        state.strokes = [];
        state.templates = [];
        state.currentStroke = null;
        render();
    });

    document.getElementById("template-grid").addEventListener("click", (e) => {
        const chip = e.target.closest(".template-chip");
        if (!chip) return;
        const tpl = chip.dataset.template;
        document.querySelectorAll(".template-chip").forEach((c) => c.classList.remove("is-active"));

        if (state.activeTemplate === tpl) {
            state.activeTemplate = null;
            canvas.style.cursor = state.tool === "eraser" ? "cell" : "crosshair";
        } else {
            state.activeTemplate = tpl;
            chip.classList.add("is-active");
            canvas.style.cursor = "copy";
        }
    });

    document.getElementById("color-options").addEventListener("click", (e) => {
        const chip = e.target.closest(".color-chip");
        if (!chip) return;
        document.querySelectorAll(".color-chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        state.paperColor = chip.dataset.color;
        render();
    });

    document.getElementById("btn-unfold").addEventListener("click", () => {
        renderUnfold();
    });

    document.getElementById("unfold-close").addEventListener("click", () => {
        document.getElementById("unfold-overlay").classList.remove("is-open");
    });

    document.getElementById("unfold-overlay").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.classList.remove("is-open");
        }
    });

    document.getElementById("btn-export").addEventListener("click", () => {
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = 1024;
        exportCanvas.height = 1024;
        const exCtx = exportCanvas.getContext("2d");
        const exR = 480;
        const exCx = 512;
        const exCy = 512;
        const scale = exR / RADIUS;

        exCtx.fillStyle = state.paperColor;
        exCtx.beginPath();
        exCtx.arc(exCx, exCy, exR, 0, Math.PI * 2);
        exCtx.fill();

        state.strokes.forEach((stroke) => {
            if (!stroke.points || stroke.points.length < 2) return;
            for (let i = 0; i < state.foldMode; i++) {
                exCtx.save();
                exCtx.translate(exCx, exCy);
                exCtx.rotate(i * sectorAngle());
                exCtx.translate(-exCx, -exCy);
                exCtx.beginPath();
                const p0 = stroke.points[0];
                exCtx.moveTo(exCx + (p0.x - CX) * scale, exCy + (p0.y - CY) * scale);
                for (let j = 1; j < stroke.points.length; j++) {
                    const p = stroke.points[j];
                    exCtx.lineTo(exCx + (p.x - CX) * scale, exCy + (p.y - CY) * scale);
                }
                exCtx.strokeStyle = "#fff";
                exCtx.lineWidth = (stroke.width || state.strokeWidth) * scale;
                exCtx.lineCap = "round";
                exCtx.lineJoin = "round";
                exCtx.stroke();
                exCtx.restore();
            }
        });

        const link = document.createElement("a");
        link.download = `papercut-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL("image/png");
        link.click();
    });

    document.getElementById("btn-share").addEventListener("click", () => {
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = 1024;
        exportCanvas.height = 1024;
        const exCtx = exportCanvas.getContext("2d");
        const exR = 440;
        const exCx = 512;
        const exCy = 460;
        const scale = exR / RADIUS;

        exCtx.fillStyle = "#faf3ea";
        exCtx.fillRect(0, 0, 1024, 1024);

        exCtx.fillStyle = state.paperColor;
        exCtx.beginPath();
        exCtx.arc(exCx, exCy, exR, 0, Math.PI * 2);
        exCtx.fill();

        state.strokes.forEach((stroke) => {
            if (!stroke.points || stroke.points.length < 2) return;
            for (let i = 0; i < state.foldMode; i++) {
                exCtx.save();
                exCtx.translate(exCx, exCy);
                exCtx.rotate(i * sectorAngle());
                exCtx.translate(-exCx, -exCy);
                exCtx.beginPath();
                const p0 = stroke.points[0];
                exCtx.moveTo(exCx + (p0.x - CX) * scale, exCy + (p0.y - CY) * scale);
                for (let j = 1; j < stroke.points.length; j++) {
                    const p = stroke.points[j];
                    exCtx.lineTo(exCx + (p.x - CX) * scale, exCy + (p.y - CY) * scale);
                }
                exCtx.strokeStyle = "#fff";
                exCtx.lineWidth = (stroke.width || state.strokeWidth) * scale;
                exCtx.lineCap = "round";
                exCtx.lineJoin = "round";
                exCtx.stroke();
                exCtx.restore();
            }
        });

        exCtx.fillStyle = "#6b625c";
        exCtx.font = "bold 28px serif";
        exCtx.textAlign = "center";
        exCtx.fillText("中华纸艺 · 剪纸设计器", 512, 940);
        exCtx.font = "18px serif";
        exCtx.fillText("zhonghuazhiyi.com", 512, 978);

        const link = document.createElement("a");
        link.download = `papercut-share-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL("image/png");
        link.click();
    });

    canvas.style.cursor = "crosshair";
    render();
})();