function getTemplateById(id) {
    let template = document.getElementById(id);
    return template.content.cloneNode(true);
}

function contentElToDomEl(contentEl) {
    if (!contentEl.__type) {
        let el = document.createElement("p");
        el.textContent = "(contentElToDomEl) ERROR: INVALID contentEl";
        return el;
    }
    if (contentEl.__type === "text") {
        let el = document.createElement("p");
        el.classList.add("textContentElement");
        el.textContent = contentEl.data;
        return el;
    } else if (contentEl.__type === "img") {
        let el = document.createElement("img");
        el.classList.add("imageContentElement");
        el.src = contentEl.url;
        el.alt = contentEl.caption;
        return el;
    }
}

function textContent(text) {
    return {
        __type: "text",
        data: text,
    };
}

function imageContent(url, caption) {
    return {
        __type: "img",
        url: url,
        caption: caption,
    };
}

function valideImageUrl(url) {
    if (url.length == 0) {
        return false;
    }
    return true;
}

function valideImageCaption(caption) {
    if (caption.length < 10 || caption.length > 100) {
        return false;
    }
    return true;
}

function getUid() {
    let now = new Date();
    let timestamp = now.getTime();
    let randomNumber = Math.ceil(Math.random() * 0xffffffff);
    return timestamp.toString(16) + "-" + randomNumber.toString(16);
}

function getUrlParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams;
}

function showPopup(title, text, buttons = [], hasCloseBtn = true) {
    let closeBtnId = getUid();
    let html = `<div class="popup-container">
        <div class="popup">
            <label class="sr-only" for="${closeBtnId}">Popup schließen</label>
            <button id="${closeBtnId}" class="popup-close-btn">X</button>
            <h1 class="popup-title">Popup</h1>
            <p class="popup-text"></p>
            <div class="popup-buttons">
            </div>
        </div>
    </div>`;

    let popup = htmlToElement(html);
    let popupContent = popup.querySelector(".popup");
    let closeBtn = popup.querySelector(".popup-close-btn");
    let popupTitle = popup.querySelector(".popup-title");
    let popupText = popup.querySelector(".popup-text");
    let popupButtons = popup.querySelector(".popup-buttons");

    if (hasCloseBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            popup.remove();
        });
    } else {
        closeBtn.remove();
    }

    popupTitle.textContent = title;
    popupText.textContent = text;

    let retButtons = {};
    for (let key in buttons) {
        let btn = buttons[key];
        let button = document.createElement("button");
        button.classList.add("button");
        retButtons[key] = button;
        if (typeof btn !== "object") {
            button.textContent = btn;
        } else {
            button.textContent = btn.text;
            if (btn.type) {
                button.classList.add(btn.type);
            }
        }
        popupButtons.appendChild(button);
    }

    popup.close = () => {
        popup.remove();
    };
    popup.buttons = retButtons;
    popup.popupContent = popupContent;

    document.body.appendChild(popup);

    return popup;
}

function showMsg(msg, openTime = 1000, type = "", target = null) {
    let currentMessages = document.querySelectorAll(".overlay-msg");
    for (let m of currentMessages) {
        m.classList.remove("open");
        setTimeout(() => {
            m.remove();
        },1000);
    }

    let msgEl = document.createElement('div');
    msgEl.classList.add('overlay-msg')
    msgEl.textContent = msg;

    if (type) {
        msgEl.classList.add(type);
    }

    if (!target) {
        target = document.body;
    }

    target.appendChild(msgEl);
    setTimeout(() => {
        msgEl.classList.add("open");
    }, 1);

    setTimeout(() => {
        msgEl.classList.remove("open");
        setTimeout(() => {
            msgEl.remove();
        },1000);
    }, openTime);
}

function startLoadingAnimation(target = null) {
    let loadingEl = document.createElement("div");
    loadingEl.classList.add("loading-overlay");
    let id = getUid();
    // console.log(target);
    loadingEl.id = id; 
    if (!target) {
        target = document.body;
        loadingEl.style.position = 'fixed';
        loadingEl.style.height = '100vh';
    }
    if (!target.style.position) {
        target.style.position = "relative";
    }
    if(typeof(window.loadingAnimationStartRequired) !== 'object')
    {
        window.loadingAnimationStartRequired = {};
    }
    window.loadingAnimationStartRequired[id] = true;

    setTimeout(() => {
        if (window.loadingAnimationStartRequired[id]) {
            target.appendChild(loadingEl);
        }
    }, 200);

    return loadingEl.id;
}

function endLoadingAnimation(id) {
    if(!id) {
        let loadingAnimations = document.querySelectorAll('.loading-overlay');
        // console.log(loadingAnimations);
        for(let el of loadingAnimations)
        {
            el.remove();
        }
        return true;
    }
    window.loadingAnimationStartRequired[id] = false;
    let loadingEl = document.getElementById(id);
    if (!loadingEl) {
        return false;
    }

    if (!loadingEl.classList.contains("loading-overlay")) {
        return false;
    }

    loadingEl.remove();
    return true;
}

function htmlToElement(html) {
    let el = document.createElement("div");
    el.innerHTML = html;
    // console.log(el.firstElementChild);
    return el.firstElementChild;
}

function convertRelativePath(path) {
    let pathParts = window.location.href.split("/");
    let filenamePats = pathParts[pathParts.length - 1].split('?');
    let filename = filenamePats[0];
    if (path.startsWith("../")) {
        if (filename === "index.html" || !filename.endsWith('.html')) {
            return path.substring(1, path.length);
        } else {
            return path;
        }
    } else if (path.startsWith("./")) {
        if (filename !== "index.html" || !filename.endsWith('.html')) {
            return "." + path;
        } else {
            return path;
        }
    }
    return path;
}

function contentElementToDomElement(el) {
    let domEL;
    switch (el.__type) {
        case "img":
            if (!el.url) return null;
            domEL = document.createElement("img");
            domEL.classList.add("post-img");
            domEL.alt = el.caption;
            domEL.src = el.url;
            break;
        case "text":
            domEL = document.createElement("p");
            domEL.textContent = el.data;
            break;
    }
    return domEL;
}

function getPostPreviewCard(post) {
    let content = [];
    if (post.content) {
        content.push(...post.content);
    }
    if (post.sections) {
        for (let section of post.sections) {
            if (section.content) {
                content.push(...section.content);
            }
        }
    }

    let firstImg = null;
    let firstText = null;
    let postUrl = convertRelativePath(
        `./view-post/view-post.html?id=${post.id}`
    );

    for (let el of content) {
        if (el.__type == "img") {
            firstImg = contentElementToDomElement(el);
            break;
        }
    }

    for (let el of content) {
        if (el.__type == "text") {
            firstText = contentElementToDomElement(el);
            break;
        }
    }

    let card = document.createElement("div");
    card.classList.add("post-card");

    let title = document.createElement("h1");
    title.textContent = post.title;
    card.appendChild(title);

    if (firstText) {
        let words = firstText.textContent.split(" ");
        firstText.textContent = "";
        for (let i = 0; i < Math.min(50, words.length); i++) {
            firstText.textContent += words[i] + " ";
        }

        firstText.innerHTML += ` <a href="${postUrl}">[...]</a>`;
        card.appendChild(firstText);
    }

    if (firstImg) {
        card.appendChild(firstImg);
        let overlay = document.createElement("div");
        overlay.classList.add("post-img-overlay");
        card.appendChild(overlay);
    }

    card.onclick = (e) => {
        e.preventDefault();
        window.location = postUrl;
    };
    return card;
}

function getButton(text, classes) {
    let btn = document.createElement("button");
    btn.textContent = text;
    btn.classList.add("button");
    for (let c of classes) {
        btn.classList.add(c);
    }

    return btn;
}
