(() => {
// 纸艺工坊 SVG 生成器

const PAPER_TYPES = {
    papercut: "剪纸",
    origami: "折纸",
    "paper-sculpture": "纸雕",
};

const PAPER_STYLES = {
    classic: {
        label: "古意",
        background: "#fffdf9",
        primary: "#b4492f",
        secondary: "#ead8c5",
        line: "#7b3a28",
    },
    festive: {
        label: "节庆",
        background: "#fff6f0",
        primary: "#c63f2f",
        secondary: "#f3bf9d",
        line: "#8e2518",
    },
    shadow: {
        label: "静影",
        background: "#faf7f2",
        primary: "#4a443f",
        secondary: "#d5c9ba",
        line: "#2f2b27",
    },
};

const DEFAULT_TYPE = "papercut";
const DEFAULT_STYLE = "classic";
const SVG_SIZE = 640;
const INITIAL_SEED = 20240608;

const CLASSIC_PRESETS = [
    {
        type: "papercut",
        style: "festive",
        density: 3,
        seed: 888888,
        modelName: "连株喜字团花",
        descName: "八角对称剪法，融合传统双喜、如意和连云图样，展示典型的民间剪纸风格。"
    },
    {
        type: "origami",
        style: "classic",
        density: 2,
        seed: 1234567,
        modelName: "折纸瑞鹤迎春",
        descName: "立体折纸千纸鹤，精密地描画纸鹤展翅瞬间的几何谷折、峰折褶皱结构。"
    },
    {
        type: "paper-sculpture",
        style: "shadow",
        density: 3,
        seed: 9876543,
        modelName: "月照鹿影深山",
        descName: "五层立体纸雕，表现明月、松枝、山岚和一只林中鹿的透视重叠关系。"
    }
];

// 简易随机发生器（基于种子）
function createRng(seedText) {
    let hash = 2166136261;
    for (let index = 0; index < seedText.length; index += 1) {
        hash ^= seedText.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return function next() {
        hash += 0x6d2b79f5;
        let value = hash;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function toRadians(angle) {
    return (angle * Math.PI) / 180;
}

function polarPoint(cx, cy, radius, angle) {
    const radian = toRadians(angle);
    return {
        x: cx + Math.cos(radian) * radius,
        y: cy + Math.sin(radian) * radius,
    };
}

function polygonPath(points) {
    if (!points.length) return "";
    return `${points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")} Z`;
}

function normalizeType(value) {
    return  Object.hasOwn(PAPER_TYPES, value) ? value : DEFAULT_TYPE;
}

function normalizeStyle(value) {
    return  Object.hasOwn(PAPER_STYLES, value) ? value : DEFAULT_STYLE;
}

// 1. 剪纸生成
function drawCutShape(r, a, size, type, fill, stroke, strokeWidth) {
    const p = polarPoint(0, 0, r, a);
    let shapePath = "";
    if (type === 0) {
        // 叶形
        const p2 = polarPoint(0, 0, r + size, a);
        const left = polarPoint(0, 0, r + size / 2, a - 2.5);
        const right = polarPoint(0, 0, r + size / 2, a + 2.5);
        shapePath = polygonPath([p, left, p2, right]);
    } else if (type === 1) {
        // 月牙形
        const a1 = a - 3.5;
        const a2 = a + 3.5;
        const start = polarPoint(0, 0, r, a1);
        const end = polarPoint(0, 0, r, a2);
        shapePath = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)} A ${(r * 0.96).toFixed(1)} ${(r * 0.96).toFixed(1)} 0 0 0 ${start.x.toFixed(1)} ${start.y.toFixed(1)}`;
    } else if (type === 2) {
        // 菱形
        const top = polarPoint(0, 0, r + size / 2, a);
        const bottom = polarPoint(0, 0, r - size / 2, a);
        const left = polarPoint(0, 0, r, a - 2.5);
        const right = polarPoint(0, 0, r, a + 2.5);
        shapePath = polygonPath([top, right, bottom, left]);
    } else if (type === 3) {
        // 圆点
        return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(size * 0.45).toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
    } else {
        // 如意纹
        const r1 = r;
        const r2 = r + size;
        const start = polarPoint(0, 0, r1, a - 2);
        const mid = polarPoint(0, 0, (r1 + r2) / 2, a + 2);
        const end = polarPoint(0, 0, r2, a - 2);
        shapePath = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)} Z`;
    }
    return `<path d="${shapePath}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
}

function renderPapercut(state, palette, rng) {
    const isTemplate = state.renderMode === "template";
    const center = SVG_SIZE / 2;
    // 计算分瓣数
    const slices = (4 + Math.floor(rng() * 3)) * 2; 
    const baseAngle = 360 / slices;
    const outerRadius = 240;

    let sliceCuts = "";
    
    // 在线稿模式下，绘制无填充的红色裁剪线
    const cutFill = isTemplate ? "none" : palette.background;
    const cutStroke = isTemplate ? "#e11d48" : "none";
    const cutStrokeWidth = isTemplate ? "1" : "0";

    // 内环
    const numInnerCuts = 2 + state.density;
    for (let i = 0; i < numInnerCuts; i++) {
        const t = (i + 1) / (numInnerCuts + 1);
        const r = 35 + t * 50;
        const a = rng() * (baseAngle / 2);
        const size = 5 + rng() * 10;
        const type = Math.floor(rng() * 4);
        sliceCuts += drawCutShape(r, a, size, type, cutFill, cutStroke, cutStrokeWidth);
    }

    // 中环
    const numMidCuts = 3 + state.density * 2;
    for (let i = 0; i < numMidCuts; i++) {
        const t = (i + 1) / (numMidCuts + 1);
        const r = 95 + t * 70;
        const a = rng() * (baseAngle / 2);
        const size = 6 + rng() * 14;
        const type = Math.floor(rng() * 5);
        sliceCuts += drawCutShape(r, a, size, type, cutFill, cutStroke, cutStrokeWidth);
    }

    // 外环
    const numOuterCuts = 2 + state.density;
    for (let i = 0; i < numOuterCuts; i++) {
        const t = (i + 1) / (numOuterCuts + 1);
        const r = 175 + t * 45;
        const a = rng() * (baseAngle / 2.2);
        const size = 4 + rng() * 8;
        const type = Math.floor(rng() * 3);
        sliceCuts += drawCutShape(r, a, size, type, cutFill, cutStroke, cutStrokeWidth);
    }

    // 生成镜像和旋转图案
    let wedges = "";
    for (let i = 0; i < slices; i++) {
        const rot = i * baseAngle;
        wedges += `
            <g transform="rotate(${rot.toFixed(1)})">
                ${sliceCuts}
                <g transform="scale(1, -1) rotate(${-baseAngle.toFixed(1)})">
                    ${sliceCuts}
                </g>
            </g>
        `;
    }

    // 生成中心图案
    let centerMarkup = "";
    let centerType;
    if (state.mode === "fixed" && state.seed === 888888) {
        centerType = 2; // 同心圆
    } else {
        centerType = Math.floor(rng() * 3);
    }
    const centerRadius = 24 + state.density * 6;
    if (centerType === 0) {
        // 星形
        const pts = [];
        const numPoints = 6 + Math.floor(rng() * 3) * 2;
        for (let i = 0; i < numPoints; i++) {
            const r = i % 2 === 0 ? centerRadius : centerRadius * 0.45;
            pts.push(polarPoint(0, 0, r, (360 / numPoints) * i));
        }
        centerMarkup = `<polygon points="${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="${cutFill}" stroke="${cutStroke}" stroke-width="${cutStrokeWidth}" />`;
        state.modelName = `${numPoints}角团星`;
    } else if (centerType === 1) {
        // 花瓣
        const numPetals = 8 + Math.floor(rng() * 5);
        for (let i = 0; i < numPetals; i++) {
            const angle = (360 / numPetals) * i;
            const pt = polarPoint(0, 0, centerRadius * 0.65, angle);
            centerMarkup += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${(centerRadius * 0.35).toFixed(1)}" fill="${cutFill}" stroke="${cutStroke}" stroke-width="${cutStrokeWidth}" />`;
        }
        centerMarkup += `<circle cx="0" cy="0" r="${(centerRadius * 0.3).toFixed(1)}" fill="${cutFill}" stroke="${cutStroke}" stroke-width="${cutStrokeWidth}" />`;
        state.modelName = `${numPetals}瓣连魂`;
    } else {
        // 同心圆
        if (isTemplate) {
            centerMarkup = `
                <circle cx="0" cy="0" r="${centerRadius.toFixed(1)}" fill="none" stroke="#e11d48" stroke-width="1.2" />
                <circle cx="0" cy="0" r="${(centerRadius * 0.75).toFixed(1)}" fill="none" stroke="#e11d48" stroke-width="1.2" />
                <circle cx="0" cy="0" r="${(centerRadius * 0.5).toFixed(1)}" fill="none" stroke="#e11d48" stroke-width="1.2" />
                <circle cx="0" cy="0" r="${(centerRadius * 0.25).toFixed(1)}" fill="none" stroke="#e11d48" stroke-width="1.2" />
            `;
        } else {
            centerMarkup = `
                <circle cx="0" cy="0" r="${centerRadius.toFixed(1)}" fill="${palette.background}" />
                <circle cx="0" cy="0" r="${(centerRadius * 0.75).toFixed(1)}" fill="${palette.primary}" />
                <circle cx="0" cy="0" r="${(centerRadius * 0.5).toFixed(1)}" fill="${palette.background}" />
                <circle cx="0" cy="0" r="${(centerRadius * 0.25).toFixed(1)}" fill="${palette.primary}" />
            `;
        }
        state.modelName = (state.mode === "fixed" && state.seed === 888888) ? "连株喜字团花" : "回纹双环";
    }

    // 外部波浪边
    const numScallops = slices * 4;
    const borderPoints = [];
    for (let i = 0; i <= numScallops; i++) {
        const angle = (360 / numScallops) * i;
        const r = outerRadius - (i % 2 === 0 ? 0 : 5 + rng() * 5);
        borderPoints.push(polarPoint(0, 0, r, angle));
    }
    const borderPath = polygonPath(borderPoints);

    if (isTemplate) {
        return `
            <g transform="translate(${center}, ${center})">
                <!-- Outer cutting line -->
                <path d="${borderPath}" fill="none" stroke="#e11d48" stroke-width="1.5" />
                <!-- Concentric guidelines -->
                <circle cx="0" cy="0" r="${(outerRadius - 12).toFixed(1)}" fill="none" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2 3" />
                <circle cx="0" cy="0" r="${(outerRadius - 28).toFixed(1)}" fill="none" stroke="#94a3b8" stroke-width="0.5" stroke-dasharray="3 5" />
                <!-- Wedges -->
                ${wedges}
                <!-- Center piece -->
                ${centerMarkup}
                <!-- Printing marks -->
                <g transform="translate(${-center + 30}, ${-center + 30})">
                    <circle cx="0" cy="0" r="8" fill="none" stroke="#64748b" stroke-width="0.8" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#64748b" stroke-width="0.8" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#64748b" stroke-width="0.8" />
                </g>
                <g transform="translate(${center - 30}, ${-center + 30})">
                    <circle cx="0" cy="0" r="8" fill="none" stroke="#64748b" stroke-width="0.8" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#64748b" stroke-width="0.8" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#64748b" stroke-width="0.8" />
                </g>
                <g transform="translate(${-center + 30}, ${center - 30})">
                    <circle cx="0" cy="0" r="8" fill="none" stroke="#64748b" stroke-width="0.8" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#64748b" stroke-width="0.8" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#64748b" stroke-width="0.8" />
                </g>
                <g transform="translate(${center - 30}, ${center - 30})">
                    <circle cx="0" cy="0" r="8" fill="none" stroke="#64748b" stroke-width="0.8" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#64748b" stroke-width="0.8" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#64748b" stroke-width="0.8" />
                </g>
                <text x="0" y="${outerRadius + 38}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="500">【剪纸线稿：沿红线裁剪】</text>
            </g>
        `;
    } else {
        return `
            <g transform="translate(${center}, ${center})">
                <!-- Background base circle -->
                <path d="${borderPath}" fill="${palette.primary}" />
                <!-- Concentric delicate guidelines -->
                <circle cx="0" cy="0" r="${(outerRadius - 12).toFixed(1)}" fill="none" stroke="${palette.background}" stroke-width="1.2" stroke-opacity="0.4" />
                <circle cx="0" cy="0" r="${(outerRadius - 28).toFixed(1)}" fill="none" stroke="${palette.background}" stroke-width="0.8" stroke-opacity="0.25" stroke-dasharray="3 5" />
                <!-- Wedges -->
                ${wedges}
                <!-- Center piece -->
                ${centerMarkup}
            </g>
        `;
    }
}

// 2. 折纸生成
function renderOrigami(state, palette, rng) {
    const isTemplate = state.renderMode === "template";
    const cx = SVG_SIZE / 2;
    const cy = SVG_SIZE / 2;
    
    // 选择折纸模型：0=千纸鹤, 1=小狐狸, 2=蝴蝶
    let modelType;
    if (state.mode === "fixed" && state.seed === 1234567) {
        modelType = 0; // 鹤
    } else {
        modelType = Math.floor(rng() * 3);
    }
    const offset = (min, max) => min + rng() * (max - min);

    let facets = [];
    let creasePatterns = "";
    
    if (modelType === 0) {
        // 千纸鹤模型
        state.modelName = (state.mode === "fixed" && state.seed === 1234567) ? "折纸瑞鹤迎春" : "折纸千纸鹤";
        const v = {
            beak: { x: cx - 180 + offset(-8, 8), y: cy + 40 + offset(-4, 4) },
            head: { x: cx - 150 + offset(-8, 8), y: cy + 10 + offset(-4, 4) },
            neckBase: { x: cx - 70 + offset(-4, 4), y: cy + 40 + offset(-4, 4) },
            bodyTop: { x: cx + offset(-8, 8), y: cy - 40 + offset(-8, 8) },
            bodyBottom: { x: cx - 10 + offset(-4, 4), y: cy + 80 + offset(-8, 8) },
            centerFold: { x: cx - 30 + offset(-4, 4), y: cy + offset(-4, 4) },
            wingLeftTip: { x: cx - 90 + offset(-12, 12), y: cy - 170 + offset(-20, 20) },
            wingRightTip: { x: cx + 110 + offset(-12, 12), y: cy - 190 + offset(-20, 20) },
            tailTip: { x: cx + 200 + offset(-12, 12), y: cy - 30 + offset(-8, 8) },
            tailBase: { x: cx + 90 + offset(-8, 8), y: cy + 50 + offset(-8, 8) }
        };

        if (state.density > 1) {
            v.wingLeftTip.y -= 25;
            v.wingRightTip.y -= 25;
        }
        if (state.density > 2) {
            v.tailTip.x += 15;
        }

        facets = [
            { name: "wing-left-rear", pts: [v.bodyTop, v.wingLeftTip, v.centerFold], opacity: 0.62, fold: "mountain" },
            { name: "wing-left-front", pts: [v.centerFold, v.wingLeftTip, v.bodyBottom], opacity: 0.48, fold: "valley" },
            { name: "wing-right-rear", pts: [v.bodyTop, v.wingRightTip, v.centerFold], opacity: 0.32, fold: "mountain" },
            { name: "wing-right-front", pts: [v.centerFold, v.wingRightTip, v.bodyBottom], opacity: 0.22, fold: "valley" },
            { name: "neck-front", pts: [v.head, v.neckBase, v.bodyBottom], opacity: 0.68, fold: "valley" },
            { name: "neck-back", pts: [v.bodyTop, v.neckBase, v.head], opacity: 0.54, fold: "mountain" },
            { name: "beak-fold", pts: [v.beak, v.head, v.neckBase], opacity: 0.76, fold: "valley" },
            { name: "tail-front", pts: [v.bodyTop, v.tailBase, v.tailTip], opacity: 0.42, fold: "valley" },
            { name: "tail-back", pts: [v.tailBase, v.bodyBottom, v.tailTip], opacity: 0.36, fold: "mountain" },
            { name: "body-center", pts: [v.bodyTop, v.centerFold, v.bodyBottom], opacity: 0.78, fold: "mountain" }
        ];

        // 背景折痕网格
        const numRings = state.density + 2;
        for (let r = 1; r <= numRings; r++) {
            const radius = (r / (numRings + 1)) * 260;
            const pts = [];
            for (let a = 0; a < 8; a++) {
                pts.push(polarPoint(cx, cy, radius, a * 45 + 22.5));
            }
            const strokeColor = isTemplate ? "#e2e8f0" : palette.line;
            const strokeOpacity = isTemplate ? 0.8 : 0.12;
            creasePatterns += `<polygon points="${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="0.8" stroke-dasharray="3 4" />`;
        }

    } else if (modelType === 1) {
        // 小狐狸模型
        state.modelName = "折纸小狐狸";
        const v = {
            earL: { x: cx - 120 + offset(-10, 10), y: cy - 150 + offset(-15, 15) },
            earR: { x: cx + 120 + offset(-10, 10), y: cy - 150 + offset(-15, 15) },
            headTop: { x: cx + offset(-5, 5), y: cy - 70 + offset(-5, 5) },
            nose: { x: cx + offset(-5, 5), y: cy + 130 + offset(-10, 10) },
            earBaseL: { x: cx - 60 + offset(-5, 5), y: cy - 60 + offset(-5, 5) },
            earBaseR: { x: cx + 60 + offset(-5, 5), y: cy - 60 + offset(-5, 5) },
            cheekL: { x: cx - 150 + offset(-10, 10), y: cy + 20 + offset(-10, 10) },
            cheekR: { x: cx + 150 + offset(-10, 10), y: cy + 20 + offset(-10, 10) },
            center: { x: cx + offset(-4, 4), y: cy + 10 + offset(-4, 4) }
        };

        if (state.density > 1) {
            v.earL.y -= 15;
            v.earR.y -= 15;
        }

        facets = [
            { name: "ear-left", pts: [v.headTop, v.earBaseL, v.earL], opacity: 0.65, fold: "mountain" },
            { name: "ear-right", pts: [v.headTop, v.earBaseR, v.earR], opacity: 0.55, fold: "mountain" },
            { name: "forehead-left", pts: [v.headTop, v.center, v.cheekL], opacity: 0.72, fold: "valley" },
            { name: "forehead-right", pts: [v.headTop, v.center, v.cheekR], opacity: 0.42, fold: "valley" },
            { name: "cheek-left", pts: [v.cheekL, v.center, v.nose], opacity: 0.82, fold: "valley" },
            { name: "cheek-right", pts: [v.cheekR, v.center, v.nose], opacity: 0.32, fold: "valley" },
            { name: "ear-flap-l", pts: [v.earBaseL, v.cheekL, v.earL], opacity: 0.50, fold: "mountain" },
            { name: "ear-flap-r", pts: [v.earBaseR, v.cheekR, v.earR], opacity: 0.28, fold: "mountain" }
        ];

        // 背景正方形折痕
        const numSquares = state.density + 2;
        for (let s = 1; s <= numSquares; s++) {
            const size = (s / (numSquares + 1)) * 480;
            const strokeColor = isTemplate ? "#e2e8f0" : palette.line;
            const strokeOpacity = isTemplate ? 0.8 : 0.1;
            creasePatterns += `<rect x="${(cx - size/2).toFixed(1)}" y="${(cy - size/2).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="1" stroke-dasharray="4 4" />`;
        }

    } else {
        // 蝴蝶模型
        state.modelName = "折纸大蝴蝶";
        const v = {
            bodyTop: { x: cx + offset(-3, 3), y: cy - 100 + offset(-5, 5) },
            bodyBottom: { x: cx + offset(-3, 3), y: cy + 100 + offset(-5, 5) },
            wingTL: { x: cx - 170 + offset(-15, 15), y: cy - 110 + offset(-15, 15) },
            wingTR: { x: cx + 170 + offset(-15, 15), y: cy - 110 + offset(-15, 15) },
            wingBL: { x: cx - 120 + offset(-12, 12), y: cy + 70 + offset(-12, 12) },
            wingBR: { x: cx + 120 + offset(-12, 12), y: cy + 70 + offset(-12, 12) },
            centerL: { x: cx - 40 + offset(-5, 5), y: cy + offset(-5, 5) },
            centerR: { x: cx + 40 + offset(-5, 5), y: cy + offset(-5, 5) }
        };

        if (state.density > 1) {
            v.wingTL.y -= 20;
            v.wingTR.y -= 20;
        }

        facets = [
            { name: "wing-top-left-inner", pts: [v.bodyTop, v.wingTL, v.centerL], opacity: 0.76, fold: "mountain" },
            { name: "wing-top-right-inner", pts: [v.bodyTop, v.wingTR, v.centerR], opacity: 0.36, fold: "mountain" },
            { name: "wing-top-left-outer", pts: [v.centerL, v.wingTL, v.bodyBottom], opacity: 0.62, fold: "valley" },
            { name: "wing-top-right-outer", pts: [v.centerR, v.wingTR, v.bodyBottom], opacity: 0.22, fold: "valley" },
            { name: "wing-bottom-left", pts: [v.centerL, v.wingBL, v.bodyBottom], opacity: 0.54, fold: "valley" },
            { name: "wing-bottom-right", pts: [v.centerR, v.wingBR, v.bodyBottom], opacity: 0.18, fold: "valley" }
        ];

        // 辐射折痕
        const numSpokes = 16 + state.density * 4;
        for (let i = 0; i < numSpokes; i++) {
            const angle = (360 / numSpokes) * i;
            const outer = polarPoint(cx, cy, 260, angle);
            const strokeColor = isTemplate ? "#e2e8f0" : palette.line;
            const strokeOpacity = isTemplate ? 0.6 : 0.08;
            creasePatterns += `<line x1="${cx}" y1="${cy}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="0.8" stroke-dasharray="3 3" />`;
        }
    }

    // 辅助线
    for (let a = 0; a < 8; a++) {
        const angle = a * 45 + 22.5;
        const outer = polarPoint(cx, cy, 270, angle);
        const strokeColor = isTemplate ? "#cbd5e1" : palette.line;
        const strokeOpacity = isTemplate ? 0.8 : 0.06;
        creasePatterns += `<line x1="${cx}" y1="${cy}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="1" />`;
    }

    let facetMarkup = "";
    let foldLinesMarkup = "";

    if (isTemplate) {
        // 线稿模式：绘制折痕（红山折，蓝谷折）
        facetMarkup = facets.map(facet => {
            const path = polygonPath(facet.pts);
            return `<path d="${path}" fill="none" stroke="#0f172a" stroke-width="1" stroke-opacity="0.25" stroke-linejoin="round" />`;
        }).join("\n");

        foldLinesMarkup = facets.map(facet => {
            let lines = "";
            for (let i = 0; i < facet.pts.length; i++) {
                const p1 = facet.pts[i];
                const p2 = facet.pts[(i + 1) % facet.pts.length];
                const isMountain = facet.fold === "mountain";
                const color = isMountain ? "#e11d48" : "#2563eb";
                const strokeDash = isMountain ? "none" : "4 3";
                lines += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${strokeDash}" />`;
            }
            return lines;
        }).join("\n");

        // 绘制图例
        const legendX = 40;
        const legendY = 40;
        const legend = `
            <g transform="translate(${legendX}, ${legendY})" font-family="sans-serif" font-size="10" fill="#64748b">
                <rect width="130" height="50" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
                <line x1="12" y1="16" x2="36" y2="16" stroke="#e11d48" stroke-width="1.8" />
                <text x="44" y="19" font-weight="500">山折线 (Mountain)</text>
                <line x1="12" y1="36" x2="36" y2="36" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="4 3" />
                <text x="44" y="39" font-weight="500">谷折线 (Valley)</text>
            </g>
            <text x="320" y="605" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="500">【折纸图纸：红线山折，蓝线谷折，外框裁切】</text>
        `;
        foldLinesMarkup += legend;

    } else {
        facetMarkup = facets.map(facet => {
            const path = polygonPath(facet.pts);
            return `<path d="${path}" fill="${palette.primary}" fill-opacity="${facet.opacity.toFixed(2)}" stroke="${palette.line}" stroke-width="1.5" stroke-opacity="0.3" stroke-linejoin="round" />`;
        }).join("\n");

        foldLinesMarkup = facets.map(facet => {
            const path = `M ${facet.pts[0].x.toFixed(1)} ${facet.pts[0].y.toFixed(1)} L ${facet.pts[1].x.toFixed(1)} ${facet.pts[1].y.toFixed(1)}`;
            return `<path d="${path}" fill="none" stroke="${palette.background}" stroke-opacity="0.45" stroke-width="1" />`;
        }).join("\n");
    }

    return `
        <g>
            <!-- Crease patterns background -->
            ${creasePatterns}
            <!-- 3D Origami Facets -->
            ${facetMarkup}
            <!-- Crease highlighted overlay -->
            ${foldLinesMarkup}
        </g>
    `;
}

// 3. 纸雕生成
function renderPaperSculpture(state, palette, rng) {
    const isTemplate = state.renderMode === "template";
    let themeType;
    if (state.mode === "fixed" && state.seed === 9876543) {
        themeType = 1; // 鹿主题
    } else {
        themeType = Math.floor(rng() * 3);
    }
    const numLayers = 3 + state.density; // 纸雕层数
    const baseTop = 150;
    const depthStep = 45;
    
    let layersMarkup = "";
    let defs = "";
    
    if (!isTemplate) {
        defs = `
            <filter id="sculpture-shadow" x="-20%" y="-20%" width="140%" height="145%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="${palette.line}" flood-opacity="0.28" />
            </filter>
        `;
    }

    // 画宝塔/树/波浪的辅助函数
    const buildPagoda = (x, y, w, h, tiers) => {
        let path = "";
        // 左侧起笔
        for (let t = 0; t < tiers; t++) {
            const ratio = (tiers - t) / tiers;
            const tierY = y - (t * (h / tiers));
            const nextTierY = y - ((t + 1) * (h / tiers));
            const tierW = w * ratio;
            
            path += ` L ${(x - tierW * 0.5).toFixed(1)} ${tierY.toFixed(1)}
                      Q ${(x - tierW * 0.6).toFixed(1)} ${(tierY - 4).toFixed(1)}, ${(x - tierW * 0.55).toFixed(1)} ${(tierY - 10).toFixed(1)}
                      L ${(x - tierW * 0.28).toFixed(1)} ${nextTierY.toFixed(1)}`;
        }
        
        // 塔尖
        path += ` L ${x.toFixed(1)} ${(y - h - 12).toFixed(1)} L ${x.toFixed(1)} ${(y - h).toFixed(1)}`;
        
        // 右侧收笔
        for (let t = tiers - 1; t >= 0; t--) {
            const ratio = (tiers - t) / tiers;
            const tierY = y - (t * (h / tiers));
            const nextTierY = y - ((t + 1) * (h / tiers));
            const tierW = w * ratio;
            
            path += ` L ${(x + tierW * 0.28).toFixed(1)} ${nextTierY.toFixed(1)}
                      L ${(x + tierW * 0.55).toFixed(1)} ${(tierY - 10).toFixed(1)}
                      Q ${(x + tierW * 0.6).toFixed(1)} ${(tierY - 4).toFixed(1)}, ${(x + tierW * 0.5).toFixed(1)} ${tierY.toFixed(1)}`;
        }
        return path;
    };

    const drawTreeLine = (top, numTrees, layerRng) => {
        let path = `M 0 640 L 0 ${(top + 50).toFixed(1)}`;
        const step = SVG_SIZE / (numTrees + 1);
        for (let i = 1; i <= numTrees; i++) {
            const tx = i * step + layerRng() * 15;
            const ty = top + 20 + layerRng() * 40;
            const tw = 20 + layerRng() * 20;
            const th = 40 + layerRng() * 40;
            
            path += ` L ${(tx - tw/2).toFixed(1)} ${(ty + th).toFixed(1)}
                      L ${tx.toFixed(1)} ${ty.toFixed(1)}
                      L ${(tx + tw/2).toFixed(1)} ${(ty + th).toFixed(1)}`;
        }
        path += ` L 640 ${(top + 50).toFixed(1)} L 640 640 Z`;
        return path;
    };

    const drawWaveLine = (top, numWaves, waveRng) => {
        let path = `M 0 640 L 0 ${(top + 40).toFixed(1)}`;
        const step = SVG_SIZE / numWaves;
        for (let i = 0; i < numWaves; i++) {
            const x1 = i * step;
            const x2 = (i + 1) * step;
            const mx = (x1 + x2) / 2;
            const my = top + 15 + waveRng() * 30;
            
            path += ` Q ${mx.toFixed(1)} ${my.toFixed(1)}, ${x2.toFixed(1)} ${(top + 40).toFixed(1)}`;
        }
        path += ` L 640 640 Z`;
        return path;
    };

    // 获取各层路径
    let bgElement = "";
    let gateFrameElement = "";
    const listPaths = [];

    if (themeType === 0) {
        state.modelName = "月下楼阁";
        // 月亮
        bgElement = `<circle cx="240" cy="210" r="90" fill="${isTemplate ? "none" : palette.secondary}" ${isTemplate ? 'stroke="#e11d48" stroke-dasharray="3 3" stroke-width="1.2"' : 'fill-opacity="0.75"'} />`;

        for (let index = 0; index < numLayers; index++) {
            const top = baseTop + index * depthStep;
            let path = "";
            if (index === 0) {
                path = `M 0 640 L 0 ${(top + 40).toFixed(1)} Q 220 ${(top - 15).toFixed(1)}, 320 ${(top + 30).toFixed(1)} T 640 ${(top + 10).toFixed(1)} L 640 640 Z`;
            } else if (index === numLayers - 1) {
                path = `M 0 640 L 0 ${(top + 30).toFixed(1)} Q 240 ${(top + 70).toFixed(1)}, 360 ${(top + 25).toFixed(1)} T 640 ${(top + 45).toFixed(1)} L 640 640 Z`;
            } else if (index === Math.floor(numLayers / 2)) {
                const pagodaX = 390 + rng() * 60;
                const pagodaY = top + 35;
                const pagodaW = 34 + state.density * 6;
                const pagodaH = 60 + state.density * 10;
                const pagodaTiers = 2 + state.density;
                const pagodaContour = buildPagoda(pagodaX, pagodaY, pagodaW, pagodaH, pagodaTiers);

                path = `M 0 640 L 0 ${(top + 45).toFixed(1)} Q 190 ${(top + 15).toFixed(1)}, 300 ${(top + 30).toFixed(1)} L ${(pagodaX - pagodaW * 0.5).toFixed(1)} ${pagodaY.toFixed(1)} ${pagodaContour} L ${(pagodaX + pagodaW * 0.5).toFixed(1)} ${pagodaY.toFixed(1)} Q 480 ${(top + 20).toFixed(1)}, 640 ${(top + 35).toFixed(1)} L 640 640 Z`;
            } else {
                path = `M 0 640 L 0 ${(top + 45).toFixed(1)} Q 250 ${(top + 10).toFixed(1)}, 330 ${(top + 40).toFixed(1)} T 640 ${(top + 20).toFixed(1)} L 640 640 Z`;
            }
            listPaths.push(path);
        }

        // 外框
        const frameRadius = 240;
        const gatePath = `M 0 0 L 640 0 L 640 640 L 0 640 Z M 80 320 A ${frameRadius} ${frameRadius} 0 1 0 560 320 A ${frameRadius} ${frameRadius} 0 1 0 80 320 Z`;
        const branchPath = `M 490 130 Q 430 140, 370 190 Q 310 240, 250 220 Q 290 250, 350 230 Q 410 210, 510 170 Z M 370 190 Q 330 220, 280 260 Q 320 270, 360 230 Z`;

        if (isTemplate) {
            gateFrameElement = `
                <path d="${gatePath}" fill="none" stroke="#e11d48" stroke-width="1.5" />
                <path d="${branchPath}" fill="none" stroke="#e11d48" stroke-width="1.2" />
                <circle cx="320" cy="320" r="${frameRadius - 4}" fill="none" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="4 2" />
            `;
        } else {
            gateFrameElement = `
                <path d="${gatePath}" fill="${palette.primary}" fill-opacity="0.95" filter="url(#sculpture-shadow)" />
                <path d="${branchPath}" fill="${palette.primary}" fill-opacity="0.95" />
                <circle cx="320" cy="320" r="${frameRadius - 4}" fill="none" stroke="${palette.secondary}" stroke-width="2" stroke-opacity="0.6" />
            `;
        }

    } else if (themeType === 1) {
        state.modelName = (state.mode === "fixed" && state.seed === 9876543) ? "月照鹿影深山" : "林深见鹿";
        // 太阳
        bgElement = `<circle cx="320" cy="200" r="80" fill="${isTemplate ? "none" : palette.secondary}" ${isTemplate ? 'stroke="#e11d48" stroke-dasharray="3 3" stroke-width="1.2"' : 'fill-opacity="0.65"'} />`;

        for (let index = 0; index < numLayers; index++) {
            const top = baseTop + index * depthStep;
            let path = "";
            if (index === 0) {
                path = drawTreeLine(top, 5, rng);
            } else if (index === numLayers - 1) {
                path = `M 0 640 L 0 ${(top + 40).toFixed(1)} Q 240 ${(top + 70).toFixed(1)}, 360 ${(top + 30).toFixed(1)} T 640 ${(top + 50).toFixed(1)} L 640 640 Z`;
            } else if (index === Math.floor(numLayers / 2)) {
                const deerX = 220 + rng() * 80;
                const deerY = top + 35;
                const deerScale = 0.6 + state.density * 0.15;
                const dPts = [
                    {x: deerX - 15 * deerScale, y: deerY - 40 * deerScale},
                    {x: deerX - 8 * deerScale, y: deerY - 30 * deerScale},
                    {x: deerX - 5 * deerScale, y: deerY - 50 * deerScale},
                    {x: deerX + 2 * deerScale, y: deerY - 35 * deerScale},
                    {x: deerX - 10 * deerScale, y: deerY - 20 * deerScale},
                    {x: deerX + 15 * deerScale, y: deerY - 10 * deerScale},
                    {x: deerX + 20 * deerScale, y: deerY + 25 * deerScale},
                    {x: deerX + 30 * deerScale, y: deerY + 22 * deerScale},
                    {x: deerX + 25 * deerScale, y: deerY + 60 * deerScale},
                    {x: deerX + 20 * deerScale, y: deerY + 60 * deerScale},
                    {x: deerX + 15 * deerScale, y: deerY + 30 * deerScale},
                    {x: deerX + 5 * deerScale, y: deerY + 60 * deerScale},
                    {x: deerX, y: deerY + 60 * deerScale},
                    {x: deerX + 5 * deerScale, y: deerY + 15 * deerScale},
                    {x: deerX - 5 * deerScale, y: deerY - 5 * deerScale}
                ];
                const deerPath = polygonPath(dPts);
                const treesPath = drawTreeLine(top, 4, rng);
                path = `${treesPath} ${deerPath}`;
            } else {
                path = drawTreeLine(top, 4, rng);
            }
            listPaths.push(path);
        }

        // 外框
        const frameRadius = 240;
        const gatePath = `M 0 0 L 640 0 L 640 640 L 0 640 Z M 80 320 A ${frameRadius} ${frameRadius} 0 1 0 560 320 A ${frameRadius} ${frameRadius} 0 1 0 80 320 Z`;
        const vinePath = `M 150 120 Q 220 140, 280 120 Q 250 150, 190 140 Z M 280 120 Q 330 110, 390 150 Q 350 160, 310 135 Z`;

        if (isTemplate) {
            gateFrameElement = `
                <path d="${gatePath}" fill="none" stroke="#e11d48" stroke-width="1.5" />
                <path d="${vinePath}" fill="none" stroke="#e11d48" stroke-width="1.2" />
                <circle cx="320" cy="320" r="${frameRadius - 4}" fill="none" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="4 2" />
            `;
        } else {
            gateFrameElement = `
                <path d="${gatePath}" fill="${palette.primary}" fill-opacity="0.95" filter="url(#sculpture-shadow)" />
                <path d="${vinePath}" fill="${palette.primary}" fill-opacity="0.95" />
                <circle cx="320" cy="320" r="${frameRadius - 4}" fill="none" stroke="${palette.secondary}" stroke-width="2" stroke-opacity="0.6" />
            `;
        }

    } else {
        state.modelName = "沧海孤舟";
        // 太阳
        bgElement = `<circle cx="320" cy="240" r="90" fill="${isTemplate ? "none" : palette.secondary}" ${isTemplate ? 'stroke="#e11d48" stroke-dasharray="3 3" stroke-width="1.2"' : 'fill-opacity="0.75"'} />`;

        for (let index = 0; index < numLayers; index++) {
            const top = baseTop + index * depthStep;
            let path = "";
            if (index === 0) {
                path = drawWaveLine(top, 4, rng);
            } else if (index === numLayers - 1) {
                path = drawWaveLine(top + 20, 5, rng);
            } else if (index === Math.floor(numLayers / 2)) {
                const boatX = 260 + rng() * 80;
                const boatY = top + 10;
                const bs = 0.5 + state.density * 0.15;
                const bPts = [
                    {x: boatX - 35 * bs, y: boatY + 20 * bs},
                    {x: boatX + 35 * bs, y: boatY + 20 * bs},
                    {x: boatX + 22 * bs, y: boatY + 32 * bs},
                    {x: boatX - 22 * bs, y: boatY + 32 * bs},
                    {x: boatX - 5 * bs, y: boatY - 25 * bs},
                    {x: boatX + 15 * bs, y: boatY - 12 * bs},
                    {x: boatX - 5 * bs, y: boatY + 15 * bs}
                ];
                const boatPath = polygonPath(bPts);
                const wavePath = drawWaveLine(top, 4, rng);
                path = `${wavePath} ${boatPath}`;
            } else {
                path = drawWaveLine(top, 4, rng);
            }
            listPaths.push(path);
        }

        // 外框
        const frameRadius = 240;
        const gatePath = `M 0 0 L 640 0 L 640 640 L 0 640 Z M 80 320 A ${frameRadius} ${frameRadius} 0 1 0 560 320 A ${frameRadius} ${frameRadius} 0 1 0 80 320 Z`;
        const bird1 = `M 220 160 Q 228 150, 235 158 Q 242 150, 250 160 Q 242 155, 235 162 Q 228 155, 220 160 Z`;
        const bird2 = `M 260 130 Q 266 122, 272 128 Q 278 122, 284 130 Q 278 126, 272 132 Q 266 126, 260 130 Z`;

        if (isTemplate) {
            gateFrameElement = `
                <path d="${gatePath}" fill="none" stroke="#e11d48" stroke-width="1.5" />
                <path d="${bird1}" fill="none" stroke="#e11d48" stroke-width="1" />
                <path d="${bird2}" fill="none" stroke="#e11d48" stroke-width="1" />
                <circle cx="320" cy="320" r="${frameRadius - 4}" fill="none" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="4 2" />
            `;
        } else {
            gateFrameElement = `
                <path d="${gatePath}" fill="${palette.primary}" fill-opacity="0.95" filter="url(#sculpture-shadow)" />
                <path d="${bird1}" fill="${palette.primary}" fill-opacity="0.8" />
                <path d="${bird2}" fill="${palette.primary}" fill-opacity="0.8" />
                <circle cx="320" cy="320" r="${frameRadius - 4}" fill="none" stroke="${palette.secondary}" stroke-width="2" stroke-opacity="0.6" />
            `;
        }
    }

    // 拼接输出
    if (isTemplate) {
        // 线稿模式：把各层并排平铺显示
        const totalCells = numLayers + 1; // 总层数
        const cols = totalCells <= 4 ? 2 : 3;
        const rows = Math.ceil(totalCells / cols);
        const cellSize = cols === 2 ? 240 : (rows === 2 ? 170 : 160);
        const gap = cols === 2 ? 30 : (rows === 2 ? 20 : 15);
        const scale = cellSize / SVG_SIZE;
        
        const startX = (SVG_SIZE - (cols * cellSize + (cols - 1) * gap)) / 2;
        const startY = (SVG_SIZE - (rows * cellSize + (rows - 1) * gap)) / 2 - 10;

        for (let i = 0; i < totalCells; i++) {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const tx = startX + c * (cellSize + gap);
            const ty = startY + r * (cellSize + gap);

            let layerContent = "";
            let labelText = "";
            
            if (i < numLayers) {
                // 纸雕层
                const path = listPaths[i];
                // 第一层画背景太阳/月亮
                const layerBg = i === 0 ? bgElement : "";
                layerContent = `
                    ${layerBg}
                    <path d="${path}" fill="none" stroke="#e11d48" stroke-width="1.8" />
                `;
                labelText = `第 ${i + 1} 层 (L${i + 1} - 雕刻线)`;
            } else {
                // 外框 layer (Moon Gate)
                layerContent = gateFrameElement;
                labelText = `最前外框 (L${i + 1} - 雕刻线)`;
            }

            layersMarkup += `
                <g transform="translate(${tx.toFixed(1)}, ${ty.toFixed(1)})">
                    <!-- Cell background wrapper -->
                    <rect width="${cellSize}" height="${cellSize}" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" rx="6" />
                    <!-- Grid and Guidelines -->
                    <g transform="scale(${scale.toFixed(4)})">
                        <rect width="${SVG_SIZE}" height="${SVG_SIZE}" fill="none" stroke="#e2e8f0" stroke-dasharray="2 3" stroke-width="2" />
                        <circle cx="320" cy="320" r="240" fill="none" stroke="#e2e8f0" stroke-dasharray="3 4" stroke-width="1.5" />
                        <!-- Layer cutout outlines -->
                        ${layerContent}
                    </g>
                    <!-- Label below cell -->
                    <text x="${cellSize / 2}" y="${cellSize + 13}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b" font-weight="600">${labelText}</text>
                </g>
            `;
        }

        // 底部提示文字
        layersMarkup += `
            <text x="320" y="610" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="500">【纸雕线稿：L1~L${numLayers + 1}代表各层图样，请将各层图案沿红线剪下后，按顺序叠放组装】</text>
        `;

    } else {
        // 成品模式：多层阴影叠放
        // 画月亮
        layersMarkup += bgElement;
        // 画山层
        for (let i = 0; i < numLayers; i++) {
            const colorOpacity = 0.15 + (i / numLayers) * 0.45;
            const path = listPaths[i];
            layersMarkup += `
                <path d="${path}" 
                      fill="${palette.primary}" 
                      fill-opacity="${colorOpacity.toFixed(2)}" 
                      stroke="${palette.line}" 
                      stroke-opacity="0.16" 
                      filter="url(#sculpture-shadow)" />
            `;
        }
        // 画最前框
        layersMarkup += gateFrameElement;
    }

    return `
        <!-- Shadow Filter Definitions -->
        <defs>${defs}</defs>
        <g>${layersMarkup}</g>
    `;
}

function renderArtwork(state, instanceId) {
    const type = normalizeType(state.type);
    const style = normalizeStyle(state.style);
    const palette = PAPER_STYLES[style];
    
    // 重置线稿配色
    const isTemplate = state.renderMode === "template";
    const bgFill = isTemplate ? "#ffffff" : palette.background;
    const borderStroke = isTemplate ? "#94a3b8" : palette.secondary;
    const borderStrokeOpacity = isTemplate ? "0.4" : "0.3";

    const seedText = `${type}|${style}|${state.density}|${state.seed}`;
    const rng = createRng(seedText);
    
    let content = "";
    if (type === "papercut") {
        content = renderPapercut(state, palette, rng);
    } else if (type === "origami") {
        content = renderOrigami(state, palette, rng);
    } else {
        content = renderPaperSculpture(state, palette, rng);
    }

    const titleId = `paper-lab-title-svg-${instanceId}`;
    const descriptionId = `paper-lab-desc-svg-${instanceId}`;
    const title = `${PAPER_TYPES[type]} - ${palette.label}`;
    const description = `复杂度 ${state.density}，种子 ${state.seed}`;

    let gridPattern = "";
    if (isTemplate) {
        gridPattern = `
            <!-- Drafting grid pattern -->
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="none" />
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.8" />
                    <circle cx="0" cy="0" r="0.8" fill="#e2e8f0" />
                </pattern>
            </defs>
            <rect width="${SVG_SIZE}" height="${SVG_SIZE}" fill="url(#grid)" />
        `;
    }

    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" role="img" aria-labelledby="${titleId} ${descriptionId}" preserveAspectRatio="xMidYMid meet">
            <title id="${titleId}">${title}</title>
            <desc id="${descriptionId}">${description}</desc>
            <rect width="${SVG_SIZE}" height="${SVG_SIZE}" fill="${bgFill}" />
            ${gridPattern}
            <rect x="24" y="24" width="${SVG_SIZE - 48}" height="${SVG_SIZE - 48}" rx="16" fill="none" stroke="${borderStroke}" stroke-width="1" stroke-opacity="${borderStrokeOpacity}" />
            ${content}
        </svg>
    `.trim();
}

function nextSeed(currentSeed) {
    return (Math.imul(currentSeed, 1664525) + 1013904223) >>> 0;
}

function initPaperLab(root, index) {
    const form = root.querySelector("[data-paper-lab-form]");
    const densityInput = root.querySelector("[data-paper-density]");
    const densityValue = root.querySelector("[data-paper-density-value]");
    const rerollButton = root.querySelector("[data-paper-reroll]");
    const downloadButton = root.querySelector("[data-paper-download]");
    const canvas = root.querySelector("[data-paper-preview]");
    const seedLabel = root.querySelector("[data-paper-lab-seed]");
    const summary = root.querySelector("[data-paper-lab-summary]");
    const status = root.querySelector("[data-paper-lab-status]");

    // 初始化 DOM 元素
    const modeTabs = root.querySelectorAll(".lab-mode-tab");
    const subpanelCurrent = root.querySelector("#panel-current");
    const subpanelFixed = root.querySelector("#panel-fixed");
    const presetCards = root.querySelectorAll(".preset-card");
    const canvasModeTabs = root.querySelectorAll(".canvas-mode-tab");
    const canvasModeLabel = root.querySelector("[data-canvas-mode-label]");

    if (!form || !densityInput || !densityValue || !rerollButton || !downloadButton || !canvas || !seedLabel || !summary || !status) {
        root.dataset.paperLabStatus = "missing-hooks";
        return;
    }

    const getSelectedType = () => {
        const checked = form.querySelector('input[name="paperType"]:checked');
        return checked ? checked.value : DEFAULT_TYPE;
    };

    const getSelectedStyle = () => {
        const checked = form.querySelector('input[name="paperStyle"]:checked');
        return checked ? checked.value : DEFAULT_STYLE;
    };

    const setSelectedType = (value) => {
        const input = form.querySelector(`input[name="paperType"][value="${value}"]`);
        if (input) input.checked = true;
    };

    const setSelectedStyle = (value) => {
        const input = form.querySelector(`input[name="paperStyle"][value="${value}"]`);
        if (input) input.checked = true;
    };

    const instanceId = root.id ? root.id : `paper-lab-${index + 1}`;
    
    // 状态管理
    const state = {
        mode: "current", // current=探索，fixed=经典
        renderMode: "artwork", // artwork=成品，template=线稿
        type: normalizeType(getSelectedType()),
        style: normalizeStyle(getSelectedStyle()),
        density: Number(densityInput.value),
        seed: INITIAL_SEED,
        modelName: ""
    };

    let selectedPresetIndex = 0;

    setSelectedType(state.type);
    setSelectedStyle(state.style);

    function syncText(actionLabel) {
        const type = normalizeType(state.type);
        const style = normalizeStyle(state.style);
        densityValue.value = String(state.density);
        densityValue.textContent = String(state.density);

        if (state.mode === "fixed") {
            seedLabel.textContent = `经典模板 (固定种子)：${state.seed}`;
            summary.textContent = `【经典图样】${PAPER_TYPES[type]}《${state.modelName}》已加载。作为文化传承的固定底稿，该模板采用手绘微调的参数。支持在此页面中自由切换“成品效果”与“纸样折线图纸”。`;
        } else {
            seedLabel.textContent = `自由探索 (随机种子)：${state.seed}`;
            summary.textContent = `【自由探索】您正在通过参数实时生成${PAPER_TYPES[type]}（${state.modelName}），表现风格为“${PAPER_STYLES[style].label}”，复杂度为 ${state.density}。点击“生成新版”即可产生一幅全新且无重复的矢量图形。`;
        }

        const modeText = state.renderMode === "template" ? "线稿图纸" : "成品预览";
        canvas.setAttribute("aria-label", `${PAPER_TYPES[type]}（${state.modelName}）${modeText}，风格 ${PAPER_STYLES[style].label}，复杂度 ${state.density}`);
        status.textContent = `${actionLabel}：${PAPER_TYPES[type]}（${state.modelName}），${PAPER_STYLES[style].label}，复杂度 ${state.density}，种子 ${state.seed}，模式 ${modeText}。`;
        
        if (canvasModeLabel) {
            canvasModeLabel.textContent = state.renderMode === "template" ? "纸样线稿" : "成品图";
            if (state.renderMode === "template") {
                canvasModeLabel.style.background = "rgba(37, 99, 235, 0.1)";
                canvasModeLabel.style.color = "#2563eb";
            } else {
                canvasModeLabel.style.background = "var(--color-accent-soft)";
                canvasModeLabel.style.color = "var(--color-accent)";
            }
        }
    }

    function render(actionLabel) {
        state.type = normalizeType(state.type);
        state.style = normalizeStyle(state.style);
        
        const svgMarkup = renderArtwork(state, instanceId);
        canvas.innerHTML = svgMarkup;
        syncText(actionLabel);
        root.dataset.paperLabStatus = "ready";
    }

    function handleControlChange() {
        if (state.mode === "current") {
            state.type = normalizeType(getSelectedType());
            state.style = normalizeStyle(getSelectedStyle());
            state.density = Number(densityInput.value);
            render("已更新草图");
        }
    }

    // 事件绑定

    // 自由探索 / 经典模板切换
    modeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const mode = tab.dataset.mode;
            if (state.mode === mode) return;

            modeTabs.forEach(t => {
                t.classList.remove("active");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            
            const otherTabId = mode === "current" ? "tab-fixed" : "tab-current";
            const otherTab = root.querySelector(`#${otherTabId}`);
            if (otherTab) otherTab.setAttribute("aria-selected", "false");

            state.mode = mode;

            if (mode === "current") {
                subpanelCurrent.classList.remove("d-none");
                subpanelFixed.classList.add("d-none");
                
                // 同步表单值
                state.type = normalizeType(getSelectedType());
                state.style = normalizeStyle(getSelectedStyle());
                state.density = Number(densityInput.value);
                // 保留上一次随机的种子
                render("已切换至自由探索");
            } else {
                subpanelCurrent.classList.add("d-none");
                subpanelFixed.classList.remove("d-none");

                // 加载经典模板配置
                const preset = CLASSIC_PRESETS[selectedPresetIndex];
                state.type = preset.type;
                state.style = preset.style;
                state.density = preset.density;
                state.seed = preset.seed;
                render("已加载经典模板");
            }
        });
    });

    // 切换经典卡片
    presetCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            if (state.mode !== "fixed") return;
            presetCards.forEach(c => {
                c.classList.remove("active");
            });
            card.classList.add("active");
            
            selectedPresetIndex = index;
            const preset = CLASSIC_PRESETS[index];
            state.type = preset.type;
            state.style = preset.style;
            state.density = preset.density;
            state.seed = preset.seed;
            render("已加载经典模板");
        });

        // 键盘支持
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.click();
            }
        });
    });

    // 成品图 / 纸样线稿切换
    canvasModeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const mode = tab.dataset.canvasMode;
            if (state.renderMode === mode) return;

            canvasModeTabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            state.renderMode = mode;
            render("已切换画布模式");
        });
    });

    form.addEventListener("input", handleControlChange);
    form.addEventListener("change", handleControlChange);

    rerollButton.addEventListener("click", () => {
        if (state.mode === "current") {
            state.seed = nextSeed(state.seed);
            render("已重生成草图");
        }
    });

    downloadButton.addEventListener("click", () => {
        const type = normalizeType(state.type);
        const style = normalizeStyle(state.style);
        const svg = renderArtwork(state, `${instanceId}-download`);
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        const modeSuffix = state.renderMode === "template" ? "-pattern" : "-render";
        link.download = `paper-realm-${type}-${state.modelName}-${style}-d${state.density}-s${state.seed}${modeSuffix}.svg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        
        const modeText = state.renderMode === "template" ? "线稿图纸" : "成品预览";
        status.textContent = `已下载 ${modeText}：${PAPER_TYPES[type]}（${state.modelName}），${PAPER_STYLES[style].label}，种子 ${state.seed}。`;
    });

    // 初始化
    render("已生成默认草图");
}

document.querySelectorAll("[data-paper-lab-root]").forEach((root, index) => {
    initPaperLab(root, index);
});
})();
