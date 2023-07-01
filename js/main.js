var mainbody = document.getElementById("main-body");

if (window.matchMedia('(prefers-color-scheme: dark)').matches && getCookie("dark-mode") != "no") {
    setCookie("dark-mode", "yes", 30);
    mainbody.classList.add("mdui-theme-layout-dark");
}
function darkmod_use() {
    if (getCookie("dark-mode") == "yes") {
        mainbody.classList.remove("mdui-theme-layout-dark");
        setCookie("dark-mode", "no", 30);
        mdui.snackbar({
            message: '亮主题'
        });
    } else {
        mainbody.classList.add("mdui-theme-layout-dark");
        setCookie("dark-mode", "yes", 30)
        mdui.snackbar({
            message: '暗主题'
        });
    }
};

add_pic = function () {
    var imgs = document.getElementsByTagName('img');
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].classList.add('mdui-img-fluid')
    };
};

updateBackToTopBtnStatus()
window.onscroll = function () {
    updateBackToTopBtnStatus();
};
function updateBackToTopBtnStatus() {
    var btn = document.getElementById("backToTop");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        btn.classList.remove("mdui-fab-hide");
    } else {
        btn.classList.add("mdui-fab-hide");
    }
}
function scrollToTop() {
    if (window.scrollTo) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
}

function Share(toWhere) {
    var link;
    switch (toWhere) {
        case "WeiBo":
            link = "http://service.weibo.com/share/share.php?url=" + window.location.href;
            break;
        case "QQ":
            link = "http://connect.qq.com/widget/shareqq/index.html?url=" + window.location.href;
            break;
        case "Url":
            var clipboard = new ClipboardJS();
            clipboard.on('success', function (e) {
                mdui.snackbar({
                    message: '复制成功'
                });
            });

            clipboard.on('error', function (e) {
                mdui.snackbar({
                    message: '复制失败'
                });
            });

            clipboard.copy(window.location.href);
            return;
    }
    window.open(link, "_blank");
}

function setCookie(name, value, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

function getCookie(name) {
    var cookieName = name + '=';
    var cookieArray = document.cookie.split(';');

    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return decodeURIComponent(cookie.substring(cookieName.length));
        }
    }

    return null;
}
