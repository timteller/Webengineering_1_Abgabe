const loginFormCard = document.querySelector('.content-card');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const loginBtn = document.querySelector('#login-btn');

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    let username = usernameInput.value;
    let password = passwordInput.value;
    let loadingAnimation = startLoadingAnimation(loginFormCard);
    let res = await api.login(username, password);
    endLoadingAnimation(loadingAnimation);
    if (!res.success) {
        // showMsg(res.msg,5000,'error',loginFormCard);
        showPopup('Fehler', res.msg);
        return false;
    }

    window.location = '../index.html';
    // console.log(res);
});
