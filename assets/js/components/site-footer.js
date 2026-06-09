(() => {
    const pageLinks = window.PaperArt?.pageLinks || [];

    class SiteFooter extends HTMLElement {
        connectedCallback() {
            const flatLinks = [];

            // 动态计算路径前缀（兼容根目录与子目录）
            const pathname = window.location.pathname;
            const isSubfolder = pathname.includes("/culture/") || pathname.includes("/about/") || pathname.includes("/resources/");
            const pagePrefix = isSubfolder ? "../" : "./";
            const assetPrefix = isSubfolder ? "../../" : "../";

            pageLinks.forEach((item) => {
                if (item.children) {
                    flatLinks.push(...item.children);
                } else if (item.key !== "home") {
                    flatLinks.push(item);
                }
            });

            const footerLinks = flatLinks.map((item) => {
                const externalAttrs = item.external ? ' target="_blank" rel="noreferrer"' : "";
                const href = item.external ? item.href : `${pagePrefix}${item.href}`;
                return `<a class="footer-link" href="${href}"${externalAttrs}>${item.text}</a>`;
            }).join("");

            this.innerHTML = `
                <footer class="site-footer">
                    <div class="site-footer__inner">
                        <section class="site-footer__brand">
                            <div class="site-brand site-brand--footer">
                                <img class="site-brand__logo" src="${assetPrefix}assets/icons/icon-full-96.svg" alt="中华纸艺 Logo">
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
})();
