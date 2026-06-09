import { pageLinks } from "./site-links.js";

class SiteNavbar extends HTMLElement {
    connectedCallback() {
        const active = this.getAttribute("active") || document.body.dataset.page || "home";

        // 动态计算路径前缀（兼容根目录与子目录）
        const pathname = window.location.pathname;
        const isSubfolder = pathname.includes("/culture/") || pathname.includes("/about/") || pathname.includes("/resources/");
        const pagePrefix = isSubfolder ? "../" : "./";
        const assetPrefix = isSubfolder ? "../../" : "../";

        function renderLink(item) {
            const isActive = item.key && item.key === active;
            const externalAttrs = item.external ? ' target="_blank" rel="noreferrer"' : "";
            const href = item.external ? item.href : `${pagePrefix}${item.href}`;
            return `<a class="nav-link${isActive ? " is-active" : ""}" href="${href}"${externalAttrs}${isActive ? ' aria-current="page"' : ""}>${item.text}</a>`;
        }

        function renderDropdown(group) {
            const hasActiveChild = group.children.some((child) => child.key === active);
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
                    <a class="site-brand" href="${pagePrefix}home.html" aria-label="返回首页">
                        <img class="site-brand__logo" src="${assetPrefix}assets/icons/icon-full-96.svg" alt="中华纸艺 Logo">
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

if (!customElements.get("site-navbar")) {
    customElements.define("site-navbar", SiteNavbar);
}
