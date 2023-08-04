const registerFormCard = document.querySelector('.content-card');
const usernameInput = document.querySelector('#username');
const displayNameInput = document.querySelector('#display-name');
const descriptionInput = document.querySelector('#description');
const passwordInput = document.querySelector('#password');
const repeatPasswordInput = document.querySelector('#repeat-password');
const loginBtn = document.querySelector('#login-btn');

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    let username = usernameInput.value;
    let displayName = displayNameInput.value;
    let description = descriptionInput.value;
    let password = passwordInput.value;
    let repeatedPassword = repeatPasswordInput.value;

    if (password !== repeatedPassword) {
        showPopup('Fehler', 'Die Passwörter stimmen nicht überein');
        return false;
    }

    let loadingAnimation = startLoadingAnimation(registerFormCard);

    let res = await api.createUser(
        username,
        password,
        displayName,
        description
    );
    endLoadingAnimation(loadingAnimation);
    if (!res.success) {
        // showMsg(res.msg,5000,'error',registerFormCard);
        showPopup('Fehler', res.msg);
        return false;
    }
    usernameInput.value = '';
    displayNameInput.value = '';
    descriptionInput.value = '';
    passwordInput.value = '';
    repeatPasswordInput.value = '';
    showMsg(
        'Registrierung erfolgreich. Du kannst dich jetzt einloggen.',
        5000,
        'correct',
        registerFormCard
    );
    // console.log(res);
});
