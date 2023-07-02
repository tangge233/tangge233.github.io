var mainbody = document.getElementById("main-body");
var mainDrawer = document.getElementById("main-drawer");

if (window.matchMedia('(prefers-color-scheme: dark)').matches && getCookie("dark-mode") == null) {
    setCookie("dark-mode", "yes", 30);
}
darkmodeUpdate();
function darkmod_use() {
    if (getCookie("dark-mode") == "yes") {
        setCookie("dark-mode", "no", 30);
        mdui.snackbar({
            message: '亮主题'
        });
    } else if (getCookie("dark-mode") == "no") {
        setCookie("dark-mode", "yes", 30)
        mdui.snackbar({
            message: '暗主题'
        });
    } else if (getCookie("dark-mode") == "byTime") {
        setCookie("dark-mode", "no", 30);
        mdui.snackbar({
            message: '亮主题'
        });
    }
    darkmodeUpdate();
};
function darkmodeUpdate() {
    var type = getCookie("dark-mode");
    switch (type) {
        case "yes":
            mainbody.classList.add("mdui-theme-layout-dark");
            mainDrawer.classList.add("mdui-theme-layout-dark");
            break;
        case "no":
            mainbody.classList.remove("mdui-theme-layout-dark");
            mainDrawer.classList.remove("mdui-theme-layout-dark");
            mainDrawer.classList.add("mdui-color-white");
            break;
        case "byTime":
            if (Date.prototype.getHours >= 6 && Date.prototype.getHours <= 18) {
                setCookie("dark-mode", "no", 30);
            } else {
                setCookie("dark-mode", "yes", 30);
            }
            break;
        default:
            setCookie("dark-mode", "byTime", 30);
            darkmodeUpdate();
            break;
    }
}

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
            ClipboardJS.copy(window.location.href);
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
