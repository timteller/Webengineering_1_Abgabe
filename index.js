const cards = document.getElementsByClassName('post-card');
const postGrid = document.getElementById('post-grid');
const contentContainer = document.querySelector('.content-container');

async function loadPosts() {
    let loadingAnimation = startLoadingAnimation(contentContainer);
    let res = await api.getPosts();
    if (!res.success) {
        return false;
    }
    let posts = res.data;

    for (let post of posts) {
        postGrid.appendChild(getPostPreviewCard(post));
    }
    endLoadingAnimation(loadingAnimation);
}
loadPosts();
