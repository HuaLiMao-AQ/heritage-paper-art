(() => {
    window.PaperArt = window.PaperArt || {};
    window.PaperArt.pageLinks = [
        { key: "home", text: "首页", href: "home.html" },
        {
            text: "纸艺文化",
            children: [
                { key: "history", text: "纸艺历史", href: "culture/history.html" },
                { key: "papercut", text: "剪纸艺术", href: "culture/papercut.html" },
                { key: "origami", text: "折纸艺术", href: "culture/origami.html" },
                { key: "paper-sculpture", text: "纸雕艺术", href: "culture/paper-sculpture.html" },
            ],
        },
        { key: "gallery", text: "作品展示", href: "gallery.html" },
        {
            text: "学习资源",
            children: [
                { key: "tutorials", text: "纸艺教程", href: "resources/tutorials.html" },
                { text: "剪纸教程", href: "https://www.aizhezhi.com/list/zhiyi_jianzhi/", external: true },
                { text: "折纸教程", href: "https://cn.howorigami.com/", external: true },
                { text: "纸雕教程", href: "https://www.aizhezhi.com/list/zhiyi_zhidiao/", external: true },
            ],
        },
        {
            text: "关于",
            children: [
                { key: "artists", text: "艺术家", href: "about/artists.html" },
                { key: "about", text: "关于纸艺", href: "about/about.html" },
            ],
        },
    ];
})();
