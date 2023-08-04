let CURRENT_DRAGGED_ELEMENT = null;
let CHANGES_MADE = 0;
const urlParams = getUrlParams();
const mainTitleInput = document.querySelector('.main-title-input');
const postElementsContainer = document.querySelector(
    '.post-elements-container'
);
const textElementTemplate = document.querySelector('#text-element-template');
const imageElementTemplate = document.querySelector('#image-element-template');
const firstDragDropTarget = document.querySelector('#first-drag-drop-target');
const contentContainer = document.querySelector('.content-container');

const addTextBtn = document.querySelector('#add-text');
const addSectionBtn = document.querySelector('#add-headline');
const addImgBtn = document.querySelector('#add-img');

const saveBtn = document.querySelector('#save-btn');
const leaveBtn = document.querySelector('#leave-btn');
const postDeleteBtn = document.querySelector('#post-delete-btn');

const showTutorialBtn = document.querySelector('#show-tutorial');

addTextBtn.addEventListener('click', (e) => {
    addTextElement('p');
    CHANGES_MADE++;
});

addSectionBtn.addEventListener('click', (e) => {
    addTextElement('h2');
    CHANGES_MADE++;
});

addImgBtn.addEventListener('click', (e) => {
    addImageElement();
    CHANGES_MADE++;
});

mainTitleInput.addEventListener('change', (e) => {
    CHANGES_MADE++;
});

showTutorialBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showTutorial(true);
});

saveBtn.addEventListener('click', async (e) => {
    let loadingAnimation = startLoadingAnimation();
    await savePost();
    endLoadingAnimation(loadingAnimation);
});
leaveBtn.addEventListener('click', (e) => {
    let navTarget = '../index.html';
    if (urlParams.get('id')) {
        navTarget = '../view-post/view-post.html?id=' + urlParams.get('id');
    }
    if (CHANGES_MADE === 0) {
        window.location = navTarget;
        return;
    }

    let popup = showPopup(
        'Änderungen verwerfen?',
        'Bist du sicher, dass du die Seite Verlassen und alle Änderunegn verwerfen möchtest?',
        {
            discardChanges: {
                text: 'Änderungen verwerfen',
                type: 'neg',
            },
            saveChanges: {
                text: 'Änderungen speichern',
                type: 'pos',
            },
            stayOnSite: {
                text: 'Auf Seite bleiben',
                type: '',
            },
        }
    );

    popup.buttons.discardChanges.addEventListener('click', (e) => {
        window.location = navTarget;
    });

    popup.buttons.saveChanges.addEventListener('click', async (e) => {
        let loadingAnimation = startLoadingAnimation(popup.popupContent);
        let saved = await savePost();
        endLoadingAnimation(loadingAnimation);
        if (!saved) {
            popup.close();
            return;
        }
        window.location = navTarget;
    });

    popup.buttons.stayOnSite.addEventListener('click', (e) => {
        popup.close();
    });
});

postDeleteBtn.addEventListener('click', (e) => {
    let postId = urlParams.get('id');
    if (!postId) {
        return;
    }

    let popup = showPopup(
        'Post löschen?',
        'Bist du sicher, dass du den Post löschen möchtest?',
        {
            deletPost: {
                text: 'Ja, Post löschen',
                type: 'neg',
            },
            cancel: {
                text: 'Abbrechen',
            },
        }
    );

    popup.buttons.cancel.addEventListener('click', (e) => {
        popup.close();
    });

    popup.buttons.deletPost.addEventListener('click', async (e) => {
        let loadingAnimation = startLoadingAnimation(popup.popupContent);
        let res = await api.deletePost(postId);
        endLoadingAnimation(loadingAnimation);
        popup.close();
        if (!res.success) {
            showPopup('Fehler', res.msg);
            return;
        }

        let navigateBackPopup = showPopup(
            'Post erfolgreich gelöscht',
            'Dein Post wurde erfolgreich gelöscht.',
            {
                back: {
                    text: 'Zurück zur Übersicht',
                },
            },
            false
        );
        navigateBackPopup.buttons.back.addEventListener('click', (e) => {
            window.location = '../index.html';
        });
    });
});

makeDragDropTarget(firstDragDropTarget);
// const headlineElementTemplate = document.querySelector('#headlineElementTemplate');

function addContentElement(el) {
    if (el.__type === 'text') {
        addTextElement('p', el.data);
    } else if (el.__type === 'img') {
        addImageElement(el.url, el.caption);
    }
}

async function loadPost(id = '') {
    let loadingAnimation = startLoadingAnimation(contentContainer);
    if (!id) {
        postDeleteBtn.remove();
        endLoadingAnimation(loadingAnimation);
        return false;
    }

    let res = await api.getPost(id);
    if (!res.success) {
        endLoadingAnimation(loadingAnimation);
        window.location = './edit-post.html';
        return false;
    }
    let post = res.data;
    mainTitleInput.value = post.title;

    for (let el of post.content) {
        addContentElement(el);
    }

    for (let section of post.sections) {
        addTextElement('h2', section.sectionTitle);
        for (let el of section.content) {
            addContentElement(el);
        }
    }
    endLoadingAnimation(loadingAnimation);
    hideFirstDragDropTargetWhenNoContent();
}
loadPost(urlParams.get('id'));

async function savePost() {
    let postObj = toPostObj();
    let res = null;
    if (urlParams.get('id')) {
        res = await api.updatePost(urlParams.get('id'), postObj);
    } else {
        res = await api.createPost(postObj);
    }

    if (!res.success) {
        // showMsg(res.msg,5000,'error');
        showPopup('Fehler', res.msg, 5000, 'error');
        return false;
    }
    if (!urlParams.get('id')) {
        window.location = './edit-post.html?id=' + res.data.id;
    }
    CHANGES_MADE = 0;
    showMsg('Gespeichert!', 2000, 'correct');
    return true;
}

// https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

function makeDragDropTarget(el) {
    el.ondragover = (e) => {
        if (el.dataset.uid === CURRENT_DRAGGED_ELEMENT) {
            return true;
        }
        el.classList.add('dragover');
        return false;
    };

    el.ondragleave = (e) => {
        el.classList.remove('dragover');
    };

    el.ondrop = (e) => {
        console.log(e);
        el.classList.remove('dragover');
        let uid = e.dataTransfer.getData('uid');

        let postEL = document.getElementById('post-element-' + uid);
        let dragDropTarget = document.getElementById('drag-drop-target-' + uid);
        let switchElementsBtnContainer = document.getElementById(
            'switch-elements-btn-container-' + uid
        );
        if (el.id == 'first-drag-drop-target') {
            insertAfter(el, postEL);
        } else {
            insertAfter(el.nextElementSibling, postEL);
        }

        insertAfter(postEL, dragDropTarget);
        insertAfter(dragDropTarget, switchElementsBtnContainer);
        CHANGES_MADE++;
        CURRENT_DRAGGED_ELEMENT = null;
    };
}

function addTextElement(type, text = '') {
    let elementUid = getUid();
    let textElelement = textElementTemplate.content.cloneNode(true);
    let postElement = textElelement.querySelector('.post-element');
    postElement.id = 'post-element-' + elementUid;
    postElement.dataset.uid = elementUid;
    let dragDropTarget = textElelement.querySelector('.drag-drop-target');
    dragDropTarget.id = 'drag-drop-target-' + elementUid;
    dragDropTarget.dataset.uid = elementUid;
    let switchElementsBtnContainer = textElelement.querySelector(
        '.switch-elements-btn-container'
    );
    switchElementsBtnContainer.id =
        'switch-elements-btn-container-' + elementUid;
    let switchElementsBtn = textElelement.querySelector('.switch-elements-btn');
    switchElementsBtn.id = 'switch-elements-btn-' + elementUid;
    let switchElementsBtnLabel = textElelement.querySelector(
        '.switch-elements-btn-label'
    );
    switchElementsBtnLabel.htmlFor = 'switch-elements-btn-' + elementUid;

    let elementInputs = textElelement.querySelector('.element-inputs');
    let inputTextarea = textElelement.querySelector('.input-textarea');
    let elementPreview = textElelement.querySelector('.element-preview');
    let editBtn = elementPreview.querySelector('.edit-btn');
    let deleteBtn = textElelement.querySelector('.delete-btn');
    let previewElement = document.createElement(type);
    elementPreview.appendChild(previewElement);
    // let previewElement = textElelement.querySelector('.previewElement');

    postElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('uid', elementUid);
        CURRENT_DRAGGED_ELEMENT = elementUid;
        console.log(e);
    });

    switchElementsBtn.addEventListener('click', (e) => {
        let nextPostEl = switchElementsBtnContainer.nextElementSibling;
        let nextElUid = nextPostEl.dataset.uid;
        let nextDragDropTarget = document.getElementById(
            'drag-drop-target-' + nextElUid
        );
        let nextSwitchElementsBtnContainer = document.getElementById(
            'switch-elements-btn-container-' + nextElUid
        );
        console.log(
            nextPostEl,
            nextDragDropTarget,
            nextSwitchElementsBtnContainer
        );
        insertBefore(postElement, nextSwitchElementsBtnContainer);
        insertBefore(nextSwitchElementsBtnContainer, nextDragDropTarget);
        insertBefore(nextDragDropTarget, nextPostEl);
        hideLastSwitchElementsBtn();
        CHANGES_MADE++;
    });

    inputTextarea.value = text.replaceAll('<br>', '\n');
    postElement.dataset.data = text.replaceAll('<br>', '\n');

    let inputFocusout = (e) => {
        if (!inputTextarea.value) {
            return;
        }
        let htmlText = inputTextarea.value.replaceAll('\n', '<br>');
        postElement.dataset.data = htmlText;
        previewElement.innerHTML = htmlText;
        elementInputs.classList.add('hidden');
        elementPreview.classList.remove('hidden');
    };

    if (text) {
        inputFocusout();
    }

    inputTextarea.addEventListener('focusout', inputFocusout);

    editBtn.addEventListener('click', (e) => {
        CHANGES_MADE++;
        inputTextarea.value = previewElement.innerHTML.replaceAll('<br>', '\n');
        inputTextarea.focus();
        elementPreview.classList.add('hidden');
        elementInputs.classList.remove('hidden');
    });

    deleteBtn.addEventListener('click', (e) => {
        CHANGES_MADE++;
        postElement.remove();
        dragDropTarget.remove();
        switchElementsBtn.remove();
        hideFirstDragDropTargetWhenNoContent();
    });

    postElement.dataset.type = type;

    postElementsContainer.appendChild(textElelement);

    makeDragDropTarget(dragDropTarget);
    hideLastSwitchElementsBtn();
    hideFirstDragDropTargetWhenNoContent();
}

function addImageElement(url = '', caption = '') {
    let elementUid = getUid();
    let imageElelement = imageElementTemplate.content.cloneNode(true);
    let postElement = imageElelement.querySelector('.post-element');
    postElement.id = 'post-element-' + elementUid;
    postElement.dataset.uid = elementUid;
    let dragDropTarget = imageElelement.querySelector('.drag-drop-target');
    dragDropTarget.id = 'drag-drop-target-' + elementUid;
    dragDropTarget.dataset.uid = elementUid;
    let switchElementsBtnContainer = imageElelement.querySelector(
        '.switch-elements-btn-container'
    );
    switchElementsBtnContainer.id =
        'switch-elements-btn-container-' + elementUid;
    let switchElementsBtn = imageElelement.querySelector(
        '.switch-elements-btn'
    );
    switchElementsBtn.id = 'switch-elements-btn-' + elementUid;
    let switchElementsBtnLabel = imageElelement.querySelector(
        '.switch-elements-btn-label'
    );
    switchElementsBtnLabel.htmlFor = 'switch-elements-btn-' + elementUid;

    let elementInputs = imageElelement.querySelector('.element-inputs');
    let urlInputTextbox = imageElelement.querySelector('.input-textbox.url');
    let captionInputTextbox = imageElelement.querySelector(
        '.input-textbox.caption'
    );
    let loadImgBtn = imageElelement.querySelector('.load-img');

    let elementPreview = imageElelement.querySelector('.element-preview');
    let editBtn = elementPreview.querySelector('.edit-btn');
    let deleteBtn = imageElelement.querySelector('.delete-btn');
    let previewElement = document.createElement('img');
    previewElement.classList.add('imageContentElement');
    elementPreview.appendChild(previewElement);

    urlInputTextbox.value = url;
    postElement.dataset.url = url;
    captionInputTextbox.value = caption;
    postElement.dataset.caption = caption;

    postElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('uid', elementUid);
        CURRENT_DRAGGED_ELEMENT = elementUid;
        console.log(e);
    });

    switchElementsBtn.addEventListener('click', (e) => {
        let nextPostEl = switchElementsBtnContainer.nextElementSibling;
        let nextElUid = nextPostEl.dataset.uid;
        let nextDragDropTarget = document.getElementById(
            'drag-drop-target-' + nextElUid
        );
        let nextSwitchElementsBtnContainer = document.getElementById(
            'switch-elements-btn-container-' + nextElUid
        );
        console.log(
            nextPostEl,
            nextDragDropTarget,
            nextSwitchElementsBtnContainer
        );
        insertBefore(postElement, nextSwitchElementsBtnContainer);
        insertBefore(nextSwitchElementsBtnContainer, nextDragDropTarget);
        insertBefore(nextDragDropTarget, nextPostEl);
        hideLastSwitchElementsBtn();
        CHANGES_MADE++;
    });

    let loadImgPreview = (e) => {
        if (!urlInputTextbox.value) {
            return;
        }
        if (!captionInputTextbox.value) {
            return;
        }

        postElement.dataset.url = urlInputTextbox.value;
        postElement.dataset.caption = captionInputTextbox.value;
        previewElement.src = urlInputTextbox.value;
        previewElement.title = captionInputTextbox.value;
        previewElement.alt = captionInputTextbox.value;

        elementInputs.classList.add('hidden');
        elementPreview.classList.remove('hidden');
    };

    if (url) {
        loadImgPreview();
    }

    loadImgBtn.onclick = loadImgPreview;

    editBtn.addEventListener('click', (e) => {
        CHANGES_MADE++;
        urlInputTextbox.value = previewElement.src;
        captionInputTextbox.value = previewElement.alt;
        elementPreview.classList.add('hidden');
        elementInputs.classList.remove('hidden');
    });

    deleteBtn.addEventListener('click', (e) => {
        CHANGES_MADE++;
        postElement.remove();
        dragDropTarget.remove();
        switchElementsBtnContainer.remove();
        hideFirstDragDropTargetWhenNoContent();
    });

    postElement.dataset.type = 'img';

    postElementsContainer.appendChild(imageElelement);

    makeDragDropTarget(dragDropTarget);
    hideLastSwitchElementsBtn();
    hideFirstDragDropTargetWhenNoContent();
}

function section(headline, content = []) {
    return {
        sectionTitle: headline,
        content: content,
    };
}

function textElement(text) {
    return {
        __type: 'text',
        data: text,
    };
}

function imgElement(url, caption) {
    return {
        __type: 'img',
        url: url,
        caption: caption,
    };
}

function toPostObj() {
    let postElements = postElementsContainer.querySelectorAll('.post-element');

    let contentArraysIndex = 0;
    let contentArrays = [];
    let sections = [];
    let mainHeadline = mainTitleInput.value;

    for (let el of postElements) {
        let type = el.dataset.type;
        if (type === 'p') {
            if (!contentArrays[contentArraysIndex]) {
                contentArrays[contentArraysIndex] = [];
            }
            contentArrays[contentArraysIndex].push(
                textElement(el.dataset.data)
            );
        }
        if (type === 'img') {
            if (!contentArrays[contentArraysIndex]) {
                contentArrays[contentArraysIndex] = [];
            }
            contentArrays[contentArraysIndex].push(
                imgElement(el.dataset.url, el.dataset.caption)
            );
        } else if (type === 'h2') {
            contentArraysIndex++;
            sections.push(section(el.dataset.data));
        }
    }

    let mainContentArray = contentArrays[0] || [];

    for (let i = 1; i <= contentArraysIndex; i++) {
        sections[i - 1].content = contentArrays[i];
    }

    let postObj = {
        title: mainHeadline,
        content: mainContentArray,
        sections: sections,
    };

    return postObj;
}

function hideFirstDragDropTargetWhenNoContent() {
    let postElements = document.querySelectorAll('.post-element');
    if (postElements.length === 0) {
        firstDragDropTarget.classList.add('hidden');
        return;
    }

    firstDragDropTarget.classList.remove('hidden');
}
hideFirstDragDropTargetWhenNoContent();

function hideLastSwitchElementsBtn() {
    let switchContainers = document.querySelectorAll(
        '.switch-elements-btn-container'
    );
    for (let container of switchContainers) {
        hideSwitchElementsBtnWhenLast(container);
    }
}

function hideSwitchElementsBtnWhenLast(switchElementsBtnContainer) {
    if (!switchElementsBtnContainer.nextElementSibling) {
        switchElementsBtnContainer.classList.add('hidden');
        return;
    }

    switchElementsBtnContainer.classList.remove('hidden');
}

function showTutorial(force = false) {
    if (window.localStorage.getItem('noTutorial') === 'true' && !force) {
        return;
    }
    window.localStorage.removeItem('noTutorial');
    let popup = showPopup(
        'Anleitung',
        'Die Elemente lassen sich per Drag and Drop verschieben oder auf Mobilgeräten mit dem "⬆⬇" Button vertauschen.',
        {
            understood: {
                type: 'pos',
                text: 'Verstanden',
            },
            dontShowAgain: {
                type: '',
                text: 'Nicht erneut anzeigen',
            },
        }
    );
    popup.buttons.understood.onclick = popup.close;
    popup.buttons.dontShowAgain.onclick = () => {
        window.localStorage.setItem('noTutorial', 'true');
        popup.close();
    };
}
showTutorial();
