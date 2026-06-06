const pageLinks = [
    { key: "home", text: "首页", href: "./home.html" },
    {
        text: "纸艺文化",
        children: [
            { key: "history", text: "纸艺历史", href: "./history.html" },
            { key: "papercut", text: "剪纸艺术", href: "./papercut.html" },
            { key: "origami", text: "折纸艺术", href: "./origami.html" },
        ],
    },
    { key: "gallery", text: "作品展示", href: "./gallery.html" },
    {
        text: "学习资源",
        children: [
            { key: "tutorials", text: "教程", href: "./tutorials.html" },
            { key: "process", text: "制作流程", href: "./process.html" },
        ],
    },
    {
        text: "关于",
        children: [
            { key: "artists", text: "艺术家", href: "./artists.html" },
            { key: "about", text: "关于纸艺", href: "./about.html" },
        ],
    },
];

class SiteNavbar extends HTMLElement {
    connectedCallback() {
        const active = this.getAttribute("active") || document.body.dataset.page || "home";

        function renderLink(item) {
            const isActive = item.key === active;
            return `<a class="nav-link${isActive ? " is-active" : ""}" href="${item.href}"${isActive ? ' aria-current="page"' : ""}>${item.text}</a>`;
        }

        function renderDropdown(group) {
            const hasActiveChild = group.children.some(c => c.key === active);
            const childrenHTML = group.children.map(renderLink).join("");
            return `
                <div class="nav-dropdown">
                    <button class="nav-dropdown__trigger${hasActiveChild ? " is-active" : ""}">
                        ${group.text}
                        <span class="nav-dropdown__arrow"></span>
                    </button>
                    <div class="nav-dropdown__menu">
                        ${childrenHTML}
                    </div>
                </div>
            `;
        }

        const navLinks = pageLinks.map((item) => {
            if (item.children) return renderDropdown(item);
            return renderLink(item);
        }).join("");

        this.innerHTML = `
            <header class="site-navbar">
                <div class="site-navbar__bar">
                    <a class="site-brand" href="./home.html" aria-label="返回首页">
                        <img class="site-brand__logo" src="../assets/icons/icon-full-96.svg" alt="中华纸艺 Logo">
                        <span class="site-brand__text">中华纸艺</span>
                    </a>
                    <nav class="site-navbar__nav" aria-label="主导航">
                        ${navLinks}
                    </nav>
                </div>
            </header>
        `;
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        const flatLinks = [];
        pageLinks.forEach((item) => {
            if (item.children) {
                flatLinks.push(...item.children);
            } else if (item.key !== "home") {
                flatLinks.push(item);
            }
        });

        const footerLinks = flatLinks
            .map((item) => `<a class="footer-link" href="${item.href}">${item.text}</a>`)
            .join("");

        this.innerHTML = `
            <footer class="site-footer">
                <div class="site-footer__inner">
                    <section class="site-footer__brand">
                        <div class="site-brand site-brand--footer">
                            <img class="site-brand__logo" src="../assets/icons/icon-full-96.svg" alt="中华纸艺 Logo">
                            <span class="site-brand__text site-brand__text--footer">中华纸艺</span>
                        </div>
                        <p class="site-footer__copy">传承千年纸艺文化<br>一纸成艺，匠心独运</p>
                    </section>
                    <nav class="site-footer__nav" aria-label="页脚导航">
                        <h2 class="site-footer__heading">快速导航</h2>
                        <div class="site-footer__links">
                            ${footerLinks}
                        </div>
                    </nav>
                    <section class="site-footer__note">
                        <h2 class="site-footer__heading">文化传承</h2>
                        <p class="site-footer__copy">纸艺是中国传统文化的重要组成部分，承载着千年的智慧与美学。</p>
                    </section>
                </div>
                <div class="site-footer__bottom">© 2026 中华纸艺 · 传统文化展示平台</div>
            </footer>
        `;
    }
}

customElements.define("site-navbar", SiteNavbar);
customElements.define("site-footer", SiteFooter);