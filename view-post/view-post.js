const urlParams = getUrlParams();
const headerLeftAlignmentContainer = document.querySelector(
    '.header-left-alignment-container'
);
const postTitel = document.getElementById('post-title');
const pageTitle = document.getElementById('page-title');
const firstSections = document.getElementById('first-section');
const subheadlineContainer = document.getElementById('subheadline');
const contentContainer =
    document.getElementsByClassName('content-container')[0];

async function loadPost() {
    let loadingAnimation = startLoadingAnimation(contentContainer);
    let res = await api.getPost(urlParams.get('id'));
    if (!res.success) {
        return false;
    }

    const post = res.data;

    if (api.getLoggedInUser() === post.username) {
        let btn = document.createElement('button');
        btn.textContent = 'Bearbeiten';
        btn.classList.add('button', 'header-btn');
        headerLeftAlignmentContainer.appendChild(btn);
        btn.onclick = (e) => {
            window.location = convertRelativePath(
                '../edit-post/edit-post.html?id=' + post.id
            );
        };
    }

    postTitel.textContent = post.title;
    pageTitle.textContent = post.title;
    // pageTitle.textContent =
    // header.appendChild(btn);
    let timestamp = new Date(post.createdAt);
    let timestampText = timestamp.toLocaleDateString();
    subheadlineContainer.innerHTML += 'Erstellt von ';
    let profileLink = document.createElement('a');
    profileLink.href = convertRelativePath(
        '../profile/profile.html?username=' + post.username
    );
    profileLink.textContent = '@' + post.username;
    subheadlineContainer.appendChild(profileLink);
    subheadlineContainer.innerHTML += ' am ' + timestampText;

    // console.log(post);

    for (let contentEl of post.content) {
        firstSections.appendChild(contentElToDomEl(contentEl));
    }

    for (let section of post.sections) {
        // console.log(section);
        let sectionEl = document.createElement('section');
        let sectionHeadline = document.createElement('h2');
        sectionHeadline.classList.add('section-title');
        sectionHeadline.textContent = section.sectionTitle;
        sectionEl.appendChild(sectionHeadline);
        for (let contentEl of section.content) {
            sectionEl.appendChild(contentElToDomEl(contentEl));
        }
        contentContainer.appendChild(sectionEl);
    }
    endLoadingAnimation(loadingAnimation);
}
loadPost();
