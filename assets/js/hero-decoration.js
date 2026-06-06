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

    // ── 1. 折纸光影背景 (3D Origami Folds) ──
    // 原理：不画线，而是画“被折叠的面”，通过光影渐变和高光来体现纸张的起伏
    function drawOrigamiFolds(w, h) {
        // 第一折面：底部的对角大斜面
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.lineTo(w, h * 0.35);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        // 用渐变模拟光线打在倾斜纸面上的阴影衰减
        const grad1 = ctx.createLinearGradient(0, h * 0.35, 0, h);
        grad1.addColorStop(0, "rgba(0, 0, 0, 0.04)"); // 折痕处略暗
        grad1.addColorStop(1, "rgba(0, 0, 0, 0)");    // 向下褪淡
        ctx.fillStyle = grad1;
        ctx.fill();

        // 纸张边缘的受光高光线
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.lineTo(w, h * 0.35);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 第二折面：左侧重叠的三角折面
        ctx.beginPath();
        ctx.moveTo(0, h * 0.05);
        ctx.lineTo(w * 0.55, h * 0.45);
        ctx.lineTo(0, h * 0.65);
        ctx.closePath();

        const grad2 = ctx.createLinearGradient(0, h * 0.05, w * 0.55, h * 0.45);
        grad2.addColorStop(0, "rgba(255, 255, 255, 0.5)"); // 顶部迎光面
        grad2.addColorStop(1, "rgba(0, 0, 0, 0.02)");      // 底部背光面

        // 添加物理投影，表现纸层的堆叠厚度
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.05)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = grad2;
        ctx.fill();
        ctx.restore();

        // 折痕边缘高光
        ctx.beginPath();
        ctx.moveTo(0, h * 0.05);
        ctx.lineTo(w * 0.55, h * 0.45);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // ── 2. 实体厚度剪纸 (Solid Papercut with Drop Shadow) ──
    // 原理：抛弃 1px 细线，把图形当成“有物理厚度的面”来画，并加上红色弥散投影
    function drawPaperCut(cx, cy, R, color) {
        ctx.save();

        // 核心：添加物理投影，制造“剪纸贴在纸面上”的悬浮感
        ctx.shadowColor = "rgba(185, 28, 28, 0.25)"; // 使用带红色的投影更逼真
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 8;

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        // 剪纸外框（非常厚的描边，代表纸张实体，而不是细线）
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.lineWidth = R * 0.06; // 根据比例生成厚度
        ctx.stroke();

        // 内部副环
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.72, 0, Math.PI * 2);
        ctx.lineWidth = R * 0.03;
        ctx.stroke();

        // 实心圆心
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // 8 片实心花瓣（面）与连接纸条
        const petals = 8;
        for (let i = 0; i < petals; i++) {
            const angle = (Math.PI * 2 * i) / petals;

            // 画实心叶片
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

            // 连接环与环的“过桥”纸条（加粗线段）
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * (R * 0.72), cy + Math.sin(angle) * (R * 0.72));
            ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
            ctx.lineWidth = R * 0.04;
            ctx.stroke();
        }

        ctx.restore();
    }

    // ── 3. 散落纸片 (Floating Cut Paper Scraps) ──
    function drawPaperScrap(x, y, size, angle, color) {
        ctx.save();

        ctx.shadowColor = "rgba(185, 28, 28, 0.15)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;

        // 实心菱形碎纸片
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function draw() {
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

        // 1. 绘制立体折纸背景（光影折面）
        drawOrigamiFolds(w, h);

        // 2. 绘制具有厚度和投影的实体红色窗花剪纸 (右上)
        drawPaperCut(w * 0.75, h * 0.22, scale * 0.24, color);

        // 3. 绘制几片带有投影的散落碎纸片增加空间感
        drawPaperScrap(w * 0.15, h * 0.18, scale * 0.02, Math.PI / 6, color);
        drawPaperScrap(w * 0.85, h * 0.55, scale * 0.015, -Math.PI / 8, color);
        drawPaperScrap(w * 0.45, h * 0.65, scale * 0.012, Math.PI / 4, color);
    }

    // 初始化绘制
    draw();

    // 防抖处理窗口大小改变
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw, 100);
    });
});