const navOpenBtn = document.getElementById('nav-open-btn');
const navElement = document.getElementById('nav');

function addMenuItems() {

    let menuItems = {
        Home: './index.html',
        Users: './users/users.html',
        Registrieren: './register/register.html',
        Login: './login/login.html',
        Profil: './profile/profile.html',
        'Neuer Post': './edit-post/edit-post.html',
    };
    
    let loggedInUser = api.getLoggedInUser();
    if(loggedInUser)
    {
        delete menuItems.Login;
        delete menuItems.Registrieren;
        menuItems.Profil += '?username='+loggedInUser;
    }
    else{
        delete menuItems.Profil;
        delete menuItems['Neuer Post'];
    }


    
    
    for(let key in menuItems)
    {   
        let url = convertRelativePath(menuItems[key]);
        let aTag = document.createElement('a');
        aTag.textContent = key;
        aTag.href = url;
        navElement.appendChild(aTag);
    }
}
addMenuItems();


navOpenBtn.addEventListener('click', toggleMenu);
function toggleMenu(e) {
    if(navElement.classList.contains('open'))
    {
        navElement.classList.remove('open')
    }
    else
    {
        navElement.classList.add('open')
    }

    if(navOpenBtn.classList.contains('open'))
    {
        navOpenBtn.classList.remove('open')
    }
    else
    {
        navOpenBtn.classList.add('open')
    }
}