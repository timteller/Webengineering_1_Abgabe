const footer = document.getElementsByTagName('footer')[0];

function initFooter() {
    
    let now = new Date();
    let footerText = document.createElement('span');
    footerText.innerText = `Copyright ${now.getFullYear()} ©`;
    footer.appendChild(footerText);
}
initFooter();