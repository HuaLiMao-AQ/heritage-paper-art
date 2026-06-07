import { pageLinks } from "./site-links.js";

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

        const footerLinks = flatLinks.map((item) => {
            const externalAttrs = item.external ? ' target="_blank" rel="noreferrer"' : "";
            return `<a class="footer-link" href="${item.href}"${externalAttrs}>${item.text}</a>`;
        }).join("");

        this.innerHTML = `
            <footer class="site-footer">
                <div class="site-footer__inner">
                    <section class="site-footer__brand">
                        <div class="site-brand site-brand--footer">
                            <img class="site-brand__logo" src="../assets/icons/icon-full-96.svg" alt="中华纸艺 Logo">
                            <span class="site-brand__text site-brand__text--footer">中华纸艺</span>
                        </div>
                        <p class="site-footer__copy">传承剪纸、折纸与纸雕文化<br>一纸成艺，匠心独运</p>
                    </section>
                    <nav class="site-footer__nav" aria-label="页脚导航">
                        <h2 class="site-footer__heading">快速导航</h2>
                        <div class="site-footer__links">
                            ${footerLinks}
                        </div>
                    </nav>
                    <section class="site-footer__note">
                        <h2 class="site-footer__heading">文化传承</h2>
                        <p class="site-footer__copy">从剪纸、折纸到纸雕，纸艺始终承载着中国传统文化中的智慧、秩序与美学。</p>
                    </section>
                </div>
                <div class="site-footer__bottom">© 2026 中华纸艺 · 传统文化展示平台</div>
            </footer>
        `;
    }
}

if (!customElements.get("site-footer")) {
    customElements.define("site-footer", SiteFooter);
}
