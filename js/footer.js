const footer = document.getElementsByTagName('footer')[0];

function initFooter() {
    let footerAlignLeft = document.createElement('div');
    footerAlignLeft.classList.add('flex-container', 'row', 'start');
    footerAlignLeft.style.flex = '1';
    footer.appendChild(footerAlignLeft);

    let now = new Date();
    let footerText = document.createElement('span');
    footerText.innerText = `Copyright ${now.getFullYear()} ©`;
    footer.appendChild(footerText);

    let footerAlignRight = document.createElement('div');
    footerAlignRight.classList.add('flex-container', 'row', 'end');
    footerAlignRight.style.flex = '1';
    footer.appendChild(footerAlignRight);

    let highContrastBtn = document.createElement('button');
    highContrastBtn.classList.add('contrast-button', 'footer-button');
    highContrastBtn.id = 'high-contrast-button';
    highContrastBtn.innerHTML = '<div><div></div></div>';
    highContrastBtn.addEventListener('click', (e) => {
        toggleHighContrastMode();
        if (window.localStorage.getItem('highContrast') !== 'true') {
            highContrastBtn.classList.remove('active');
            return;
        }
        highContrastBtn.classList.add('active');
    });

    let highContrastBtnLabel = document.createElement('label');
    highContrastBtnLabel.htmlFor = 'high-contrast-button';
    highContrastBtnLabel.classList.add('sr-only');
    highContrastBtnLabel.textContent = 'Webseite mit hohem Kontrast anzeigen';

    footerAlignLeft.appendChild(highContrastBtnLabel);
    footerAlignLeft.appendChild(highContrastBtn);

    let darkModeBtn = document.createElement('button');
    darkModeBtn.classList.add('dark-mode-button', 'footer-button');
    darkModeBtn.id = 'dark-mode-button';
    darkModeBtn.innerHTML = '🌙';
    darkModeBtn.addEventListener('click', (e) => {
        toggleDarkMode();
        if (window.localStorage.getItem('dark') !== 'true') {
            darkModeBtn.classList.remove('active');
            darkModeBtn.innerHTML = '🌙';
            return;
        }
        darkModeBtn.classList.add('active');
        darkModeBtn.innerHTML = '☀️';
    });

    let darkModeBtnLabel = document.createElement('label');
    darkModeBtnLabel.htmlFor = 'dark-mode-button';
    darkModeBtnLabel.classList.add('sr-only');
    darkModeBtnLabel.textContent = 'Webseite im Dark-Mode anzeigen';

    footerAlignRight.appendChild(darkModeBtnLabel);
    footerAlignRight.appendChild(darkModeBtn);
}
initFooter();

function toggleHighContrastMode() {
    if (window.localStorage.getItem('highContrast') === 'true') {
        window.localStorage.removeItem('highContrast');
        checkHighContrastMode();
        return;
    }
    window.localStorage.setItem('highContrast', 'true');
    checkHighContrastMode();
}

function checkHighContrastMode() {
    let html = document.querySelector('html');
    if (window.localStorage.getItem('highContrast') === 'true') {
        html.classList.add('high-contrast');
        document.querySelector('#high-contrast-button').classList.add('active');
        return;
    }
    html.classList.remove('high-contrast');
}
checkHighContrastMode();

function toggleDarkMode() {
    if (window.localStorage.getItem('dark') === 'true') {
        window.localStorage.removeItem('dark');
        checkDarkMode();
        return;
    }
    window.localStorage.setItem('dark', 'true');
    checkDarkMode();
}

function checkDarkMode() {
    let html = document.querySelector('html');
    if (window.localStorage.getItem('dark') === 'true') {
        html.classList.add('dark-mode');
        let darkModeBtn = document.querySelector('#dark-mode-button');
        darkModeBtn.classList.add('active');
        darkModeBtn.innerHTML = '☀️';
        return;
    }

    html.classList.remove('dark-mode');
}
checkDarkMode();
