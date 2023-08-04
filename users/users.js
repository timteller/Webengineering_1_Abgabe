const usersTable = document.querySelector('#users-table');
const searchTable = document.querySelector('#search-table');
const userRowTemp = document.querySelector('#user-row-template');
const searchInput = document.querySelector('#search-input');
let tableRows = [];
loadUsers();
async function loadUsers() {
    let loadingAnimation = startLoadingAnimation();
    let res = await api.getUsers();
    endLoadingAnimation(loadingAnimation);
    if (!res.success) {
        showPopup('Fehler', res.msg);
        return false;
    }

    for (let user of res.data) {
        let tr = userRowTemp.content.cloneNode(true).querySelector('tr');
        let created = new Date(user.createdAt);
        let createdStr = created.toLocaleDateString();
        tr.querySelector('.username').textContent = user.username;
        tr.querySelector('.display-name').textContent =
            user.profile.displayName;
        tr.querySelector('.description').textContent = user.profile.description;
        tr.querySelector('.created').textContent = createdStr;
        tr.addEventListener('click', (e) => {
            window.location =
                '../profile/profile.html?username=' + user.username;
        });
        tr.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location =
                    '../profile/profile.html?username=' + user.username;
            }
        });
        tr.dataset.username = user.username;
        usersTable.querySelector('tbody').appendChild(tr);
        tableRows.push(tr);
    }
}

searchInput.addEventListener('input', (e) => {
    let searchVal = searchInput.value.toLocaleLowerCase();

    let searchTabelRows = searchTable.querySelectorAll('.not-header');
    for (let row of searchTabelRows) {
        row.remove();
    }

    for (let row of tableRows) {
        if (!searchVal) {
            row.classList.remove('hidden');
            usersTable.classList.remove('hidden');
            searchTable.classList.add('hidden');
            continue;
        }
        usersTable.classList.add('hidden');
        searchTable.classList.remove('hidden');
        let rowUsername = row.dataset.username.toLocaleLowerCase();
        if (rowUsername.includes(searchVal)) {
            let rowClone = row.cloneNode(true);
            rowClone.classList.add('not-header');
            rowClone.addEventListener('click', (e) => {
                row.dispatchEvent(new Event('click'));
            });
            searchTable.querySelector('tbody').appendChild(rowClone);
        }
    }
});
