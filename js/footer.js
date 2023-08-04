const footer = document.getElementsByTagName('footer')[0];

function initFooter() {
    
    let footerAlignLeft = document.createElement('div');
    footerAlignLeft.classList.add('flex-container','row');
    footerAlignLeft.style.flex = '1';
    footerAlignLeft.style.alignItems = 'felx-start';
    footer.appendChild(footerAlignLeft);

    let now = new Date();
    let footerText = document.createElement('span');
    footerText.innerText = `Copyright ${now.getFullYear()} ©`;
    footer.appendChild(footerText);

    let footerAlignRight = document.createElement('div');
    footerAlignRight.classList.add('flex-container','row');
    footerAlignRight.style.flex = '1';
    footerAlignRight.style.alignItems = 'felx-end';
    footer.appendChild(footerAlignRight);

    let highContrastBtn = document.createElement('button');
    highContrastBtn.classList.add('contrast-button');
    highContrastBtn.id = 'high-contrast-button';
    highContrastBtn.innerHTML = '<div><div></div></div>';
    highContrastBtn.addEventListener('click', (e) => {
        toggleHighContrastMode();
        if(window.localStorage.getItem('highContrast') !== 'true') {
            highContrastBtn.classList.remove('active');
            return;
        }
        highContrastBtn.classList.add('active');
    })

    let highContrastBtnLabel = document.createElement('label');
    highContrastBtnLabel.htmlFor = 'high-contrast-button';
    highContrastBtnLabel.classList.add('sr-only');
    highContrastBtnLabel.textContent = 'Webseite mit hohem Kontrast anzeigen'

    footerAlignLeft.appendChild(highContrastBtn);
    footerAlignLeft.appendChild(highContrastBtnLabel);
}
initFooter();

function toggleHighContrastMode() {
    if(window.localStorage.getItem('highContrast') === 'true')
    {
        window.localStorage.removeItem('highContrast');
        checkHighContrastMode();
        return;
    }
    window.localStorage.setItem('highContrast','true');
    checkHighContrastMode();
}


function checkHighContrastMode() {
    let html = document.querySelector('html');
    if(window.localStorage.getItem('highContrast') === 'true')
    {
        html.classList.add('high-contrast');
        document.querySelector('#high-contrast-button').classList.add('active');
        return;
    }

    html.classList.remove('high-contrast');
}
checkHighContrastMode();