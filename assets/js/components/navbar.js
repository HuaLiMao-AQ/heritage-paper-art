/**
 * 插入 Navbar 到页面中
 */
(() => {
    // 根绝对路径
    const currentScript = document.currentScript;
    const scriptUrl = currentScript ? currentScript.src : window.location.href;
    const rootUrl = new URL('../../../', scriptUrl).href;

    // 基于统一根路径，拼装任何静态资源的绝对地址
    const fontUrl = new URL('assets/fonts/ZCOOLXiaoWei-Regular.ttf', rootUrl).href;

    /**
     * 插入 Navbar 模板
     */
    function insertNavbarHtml() {
        // 配置导航路由
        const rightItems = [
            { text: "首页", path: "index.html" },
        ];

        // 获取浏览器当前 URL 的 Pathname
        const currentPathname = window.location.pathname;
        const brandHref = new URL('index.html', rootUrl).href;

        // 高级感 Logo：首字作为印章
        const brandHtml = `<a class="navbar-brand" href="${brandHref}">
            <span class="brand-seal">纸</span>
            <span class="brand-text">艺工坊</span>
        </a>`;

        const rightItemsHtml = rightItems
            .map((item) => {
                // 2. 根据项目根路径，计算每一个导航元素的统一绝对跳转地址
                const itemHref = new URL(item.path, rootUrl).href;

                // 3. 根据当前访问的 Pathname 动态计算 Active 状态
                let isActive = false;
                if (item.path === 'index.html') {
                    // 首页特殊处理：匹配 "/index.html" 或者直接是根目录 "/"
                    isActive = currentPathname.endsWith('/index.html') || currentPathname.endsWith('/') || currentPathname === '';
                } else {
                    // 其他页面：只要当前路径包含该路由特征，即视为激活
                    isActive = currentPathname.includes(item.path);
                }

                const itemClass = isActive
                    ? `navbar-item active`
                    : `navbar-item`;
                const ariaCurrent = isActive ? ` aria-current="page"` : ``;

                return `<a class="${itemClass}" href="${itemHref}"${ariaCurrent}>${item.text}</a>`;
            })
            .join("");

        const navbarHtml = `
            <header>
                <div class="navbar-container">
                    <div class="left-container">
                        ${brandHtml}
                    </div>

                    <div class="navbar-spacer"></div>

                    <nav class="right-container">
                        ${rightItemsHtml}
                    </nav>
                </div>
            </header>
        `;

        if (currentScript) {
            currentScript.insertAdjacentHTML("beforebegin", navbarHtml);
        }
    }

    /**
     * 插入 Navbar 的样式表
     */
    function insertNavbarStyle() {
        if (document.getElementById("navbar-style")) return;

        var style = document.createElement("style");
        style.id = "navbar-style";

        style.textContent = `
            @font-face {
                font-family: 'ZCOOL XiaoWei';
                src: url('${fontUrl}') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }

            :root {
                --theme-red: #B82C29; /* 故宫红/高定红 */
                --theme-ink: #1A1A1A; /* 极深墨色 */
                --theme-gray: #757575; /* 次要文字 */
                --theme-bg: #FFFFFF; /* 纯净白 */
                --theme-line: #F0EAE1; /* 极浅的暖色分割线 */
                --font-logo: 'ZCOOL XiaoWei', "Noto Serif SC", STZhongsong, "Songti SC", serif;
                --font-serif: "Noto Serif SC", STZhongsong, "Songti SC", serif;
                --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }

            /* 现代美术馆风格：极其干净、通透 */
            .navbar-container {
                display: flex;
                flex-direction: row;
                align-items: center;
                height: 88px; /* 增加高度，增加呼吸感 */
                padding-left: 8vw;
                padding-right: 8vw;
                background-color: var(--theme-bg);
                border-bottom: 1px solid var(--theme-line);
                position: relative;
                z-index: 100;
            }

            .left-container,
            .right-container {
                display: flex;
                align-items: center;
            }

            .navbar-spacer {
                flex: 1;
            }

            /* Logo - 现代中式，极简高级 */
            .navbar-brand {
                display: flex;
                align-items: center;
                text-decoration: none;
                transition: opacity 0.3s ease;
            }

            .navbar-brand:hover {
                opacity: 0.8;
            }

            /* 首字印章效果 */
            .brand-seal {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                background-color: var(--theme-red);
                color: #FFFFFF;
                font-family: var(--font-logo);
                font-size: 20px;
                font-weight: 500;
                margin-right: 12px;
                border-radius: 2px;
                /* 极其细微的阴影 */
                box-shadow: 2px 2px 8px rgba(184, 44, 41, 0.2);
            }

            .brand-text {
                font-family: var(--font-logo);
                color: var(--theme-ink);
                font-size: 22px;
                font-weight: 600;
                letter-spacing: 4px;
            }

            /* 导航菜单 - 现代排版 */
            .right-container {
                gap: 40px; /* 拉开间距，增加高级感 */
            }

            .navbar-item {
                position: relative;
                color: var(--theme-gray);
                font-family: var(--font-sans); /* 菜单使用无衬线字体，与 Logo 形成繁简对比 */
                text-decoration: none;
                font-size: 14px;
                font-weight: 400;
                letter-spacing: 1.5px;
                padding: 8px 0;
                transition: color 0.4s ease;
            }

            /* 极简红线 Hover 效果 */
            .navbar-item::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background-color: var(--theme-red);
                transform: scaleX(0);
                transform-origin: right;
                transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            }

            .navbar-item:hover,
            .navbar-item.active {
                color: var(--theme-ink);
            }

            .navbar-item:hover::after,
            .navbar-item.active::after {
                transform: scaleX(1);
                transform-origin: left;
            }

            @media (max-width: 768px) {
                .navbar-container {
                    padding-left: 24px;
                    padding-right: 24px;
                    height: 72px;
                }
                .right-container {
                    gap: 20px;
                }
                .navbar-item {
                    font-size: 13px;
                }
                .brand-seal {
                    width: 28px;
                    height: 28px;
                    font-size: 18px;
                    margin-right: 8px;
                }
                .brand-text {
                    font-size: 18px;
                    letter-spacing: 2px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    insertNavbarHtml();
    insertNavbarStyle();
})();