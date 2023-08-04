let UNSAVED_CHANGES = 0;
let user = null;
const urlParams = getUrlParams();
const headerLeftAlignmentContainer = document.querySelector(
    '.header-left-alignment-container'
);
const contantContainer = document.querySelector('.content-container');
const displayNameContainer = document.querySelector('#display-name');
const usernameContainer = document.querySelector('#username');
const descriptionContainer = document.querySelector('#description');
const profilePic = document.querySelector('.profile-pic');
const postGrid = document.querySelector('#post-grid');

const displayNameInput = document.querySelector('#display-name-input');
const descriptionInput = document.querySelector('#description-input');
const changePasswordContainer = document.querySelector(
    '#change-password-container'
);
const passwordInput = document.querySelector('#password-input');
const passwordRepeatInput = document.querySelector('#password-repeat-input');

const editBtn = getButton('Bearbeiten', ['header-btn']);
const logoutBtn = getButton('Ausloggen', ['header-btn', 'neg']);
const saveBtn = getButton('Speichern', ['header-btn', 'pos', 'hidden']);
const discardBtn = getButton('Verlassen', ['header-btn', 'hidden']);
const deleteProfileBtn = getButton('Profil Löschen', [
    'header-btn',
    'neg',
    'hidden',
]);
const visibleInEditMode = [
    saveBtn,
    discardBtn,
    deleteProfileBtn,
    displayNameInput,
    descriptionInput,
    changePasswordContainer,
];
const invisibleInEditMode = [
    editBtn,
    logoutBtn,
    displayNameContainer,
    descriptionContainer,
];
const inputs = [displayNameInput, descriptionInput];

function enterEditMode() {
    for (let el of invisibleInEditMode) {
        el.classList.add('hidden');
    }
    for (let el of visibleInEditMode) {
        el.classList.remove('hidden');
    }
}

function quitEditMode() {
    // console.log(UNSAVED_CHANGES);
    if (UNSAVED_CHANGES === 0) {
        for (let el of invisibleInEditMode) {
            el.classList.remove('hidden');
        }
        for (let el of visibleInEditMode) {
            el.classList.add('hidden');
        }
        passwordInput.value = '';
        passwordRepeatInput.value = '';
        return;
    }

    let popup = showPopup(
        'Änderungen verwerfen?',
        'Bist du sicher, dass du alle Änderunegn verwerfen möchtest?',
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
        UNSAVED_CHANGES = 0;
        quitEditMode();
        popup.remove();
    });

    popup.buttons.saveChanges.addEventListener('click', async (e) => {
        let loadingAnimation = startLoadingAnimation(popup.popupContent);
        let res = await saveChanges();
        endLoadingAnimation(loadingAnimation);
        popup.close();
        if (!res.success) {
            showPopup('Fehler', res.msg);
            return;
        }
        user = res.data;
        displayNameContainer.textContent = user.profile.displayName;
        usernameContainer.textContent = '@' + user.username;
        descriptionContainer.textContent = user.profile.description;
        quitEditMode();
    });

    popup.buttons.stayOnSite.addEventListener('click', (e) => {
        popup.close();
    });
}

async function loadData() {
    let username = urlParams.get('username');

    let msg = urlParams.get('msg');
    if (msg) {
        let type = urlParams.get('msg-type');
        let duration = urlParams.get('msg-duration');
        showMsg(msg, duration, type);
    }

    if (!username) {
        let popup = showPopup(
            'User nicht gefunden',
            'Das Profil des Nutzers wurde nicht gefunden.',
            {
                leaveBtn: {
                    text: 'Zurück',
                },
            },
            false
        );
        popup.buttons.leaveBtn.addEventListener('click', (e) => {
            window.location = '../index.html';
        });
        return false;
    }

    let loadingAnimation = startLoadingAnimation(contantContainer);
    let res = await api.getUser(username);

    if (!res.success) {
        endLoadingAnimation(loadingAnimation);
        let popup = showPopup(
            'User nicht gefunden',
            `Das Profil des Nutzers '${username}' wurde nicht gefunden.`,
            {
                leaveBtn: {
                    text: 'zurück',
                },
            },
            false
        );
        popup.buttons.leaveBtn.addEventListener('click', (e) => {
            window.location = '../index.html';
        });
        return false;
    }

    user = res.data;

    updateProfilePic(user.profile.displayName);

    if (username === api.getLoggedInUser()) {
        headerLeftAlignmentContainer.appendChild(editBtn);
        headerLeftAlignmentContainer.appendChild(logoutBtn);
        headerLeftAlignmentContainer.appendChild(saveBtn);
        headerLeftAlignmentContainer.appendChild(discardBtn);
        headerLeftAlignmentContainer.appendChild(deleteProfileBtn);

        for (let input of inputs) {
            input.addEventListener('input', (e) => {
                UNSAVED_CHANGES++;
            });
        }

        logoutBtn.addEventListener('click', (e) => {
            let res = api.logout();
            // console.log(res);
            if (!res.success) {
                showPopup('Fehler', res.msg);
                return;
            }
            window.location =
                './profile.html?msg=efolgreichh ausgeloggt&msg-duration=4000&msg-type=correct&username=' +
                username;
        });

        editBtn.addEventListener('click', (e) => {
            enterEditMode();
            displayNameInput.value = user.profile.displayName;
            // usernameInput.value = user.username;
            descriptionInput.value = user.profile.description;
        });

        discardBtn.addEventListener('click', (e) => {
            quitEditMode();
        });

        saveBtn.addEventListener('click', async (e) => {
            let loadingAnimationSave = startLoadingAnimation();
            let res = await saveChanges();
            endLoadingAnimation(loadingAnimationSave);
            if (!res.success) {
                showPopup('Fehler', res.msg);
                return false;
            }
            user = res.data;
            // console.log(res);
            displayNameContainer.textContent = user.profile.displayName;
            usernameContainer.textContent = '@' + user.username;
            descriptionContainer.textContent = user.profile.description;
            quitEditMode();
        });

        deleteProfileBtn.addEventListener('click', (e) => {
            let popup = showPopup(
                'Profil löschen',
                'Bist du dir sicher, dass du dein Profil entgültig löschen möchtest.',
                {
                    cancel: {
                        text: 'Profil nicht löschen',
                    },
                    delete: {
                        text: 'Ja, Profil endgültig löschen',
                        type: 'neg',
                    },
                }
            );

            popup.buttons.delete.addEventListener('click', async (e) => {
                let loadingAnimation = startLoadingAnimation(
                    popup.popupContent
                );
                let res = await api.deleteUser();
                endLoadingAnimation(loadingAnimation);
                popup.close();
                if (!res.success) {
                    showPopup('Fehler', res.msg);
                    return false;
                }
                let deleteSuccessPopup = showPopup(
                    'Profil gelöscht',
                    'Du hast dein Profil erfolgreich gelöscht',
                    {
                        back: {
                            text: 'Zur Startseite',
                        },
                    }
                );
                deleteSuccessPopup.buttons.back.addEventListener(
                    'click',
                    (e) => {
                        window.location = '../index.html';
                    },
                    false
                );
            });

            popup.buttons.cancel.addEventListener('click', (e) => {
                popup.close();
            });
        });
    }

    displayNameContainer.textContent = user.profile.displayName;
    displayNameContainer.classList.remove('wireframe');

    usernameContainer.textContent = '@' + user.username;
    usernameContainer.classList.remove('wireframe');

    descriptionContainer.textContent = user.profile.description;
    descriptionContainer.classList.remove('wireframe');

    let postsRes = await api.getUserPosts(username);
    if (!postsRes.success) {
        endLoadingAnimation(loadingAnimation);
        return false;
    }
    let posts = postsRes.data;

    for (let post of posts) {
        postGrid.appendChild(getPostPreviewCard(post));
    }
    endLoadingAnimation(loadingAnimation);
}
loadData();

async function saveChanges() {
    let username = user.username;
    let displayName = displayNameInput.value;
    let description = descriptionInput.value;
    let password = passwordInput.value;
    let repeatedPassword = passwordRepeatInput.value;
    if (password !== repeatedPassword) {
        showPopup(
            'Fehler',
            'Die eingegebenen Passwörter stimmen nicht überein'
        );
        return false;
    }

    if (!password) {
        password = api.getPassword();
    }

    // console.log(username,displayName,description);
    let res = await api.updateUser(
        username,
        password,
        displayName,
        description
    );

    if (!res.success) {
        return res;
    }

    passwordInput.value = '';
    passwordRepeatInput.value = '';
    updateProfilePic(displayName);
    showMsg('Gespeichert', 2000, 'correct');
    UNSAVED_CHANGES = 0;
    return res;
}

function updateProfilePic(displayName) {
    let profilePicStr = '';
    let displayNameParts = displayName.split(' ');
    for (let i = 0; i < Math.min(2, displayNameParts.length); i++) {
        let word = displayNameParts[i];
        profilePicStr += word.substring(0, 1).toLowerCase();
    }
    let col = [];
    let displayNameNoSpaces = displayName.replaceAll(' ', '');
    for (let i = 0; i < displayNameNoSpaces.length; i++) {
        let char = displayNameNoSpaces[i];
        if (!col[i % 3]) {
            col[i % 3] = 0;
        }
        col[i % 3] += char.charCodeAt(0);
        col[i % 3] %= 255;
    }
    let colStr = `rgb(${col[0]},${col[1]},${col[2]})`;
    let brightness = col.reduce((a, b) => a + b) / 3;
    textCol = 'white';
    if (brightness > 180) {
        textCol = 'black';
    }
    profilePic.style.backgroundColor = colStr;
    profilePic.style.color = textCol;
    profilePic.querySelector('span').textContent = profilePicStr;
}
