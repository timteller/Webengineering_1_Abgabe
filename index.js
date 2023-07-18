const cards = document.getElementsByClassName("post-card");
const postGrid = document.getElementById("post-grid");
const contentContainer = document.querySelector(".content-container");

// function createImageContent(url, caption) {
//     return {
//         __type: "img",
//         url: url,
//         caption: caption,
//     };
// }

// function createTextContent(content) {
//     return {
//         __type: "text",
//         data: content,
//     };
// }

// function createSection(title, content) {
//     return {
//         sectionTitle: title,
//         content: content,
//     };
// }

// function createPost(title, content, sections, id) {
//     return {
//         id: id,
//         title: title,
//         content: content,
//         sections: sections,
//     };
// }

// function randomImgPath() {
//     let names = ["img1.jpg", "img2.jpg", "img3.png", "img4.png"];
//     if (Math.random() < 0.5) {
//         return "";
//     }
//     return `./images/${names[Math.floor(Math.random() * names.length)]}`;
// }

// function createTestPosts() {
//     let posts = [];
//     for (let i = 0; i < 10; i++) {
//         let content = [
//             createImageContent(randomImgPath(), "logo"),
//             createTextContent(
//                 "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, beatae dolores provident vitae atque id asperiores, porro dolore accusantium sunt veritatis sit consequatur earum illo! Corrupti architecto iusto minus placeat."
//             ),
//         ];
//         let section1Content = [
//             createImageContent(randomImgPath(), "logo"),
//             createTextContent(
//                 "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, beatae dolores provident vitae atque id asperiores, porro dolore accusantium sunt veritatis sit consequatur earum illo! Corrupti architecto iusto minus placeat."
//             ),
//         ];
//         let section2Content = [
//             createImageContent(randomImgPath(), "logo"),
//             createTextContent(
//                 "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, beatae dolores provident vitae atque id asperiores, porro dolore accusantium sunt veritatis sit consequatur earum illo! Corrupti architecto iusto minus placeat."
//             ),
//         ];
//         let sections = [
//             createSection("section 1", section1Content),
//             createSection("section 2", section2Content),
//         ];
//         posts.push(createPost("Test", content, sections, i));
//     }
//     return posts;
// }



// function postToDom(post) {
//     let postEl = document.createElement("article");
//     let mainHeadline = document.createElement("h1");
//     mainHeadline.textContent = post.title;
//     postEl.appendChild(mainHeadline);

//     for (let el of post.content) {
//         postEl.appendChild(contentElementToDomElement(el));
//     }

//     for (let section of post.sections) {
//         let sectionDomEl = document.createElement("section");
//         let sectionTitle = document.createElement("h1");
//         sectionTitle.textContent = section.sectionTitle;
//         sectionDomEl.appendChild(sectionTitle);
//         for (let el of section.content) {
//             sectionDomEl.appendChild(contentElementToDomElement(el));
//         }
//         postEl.appendChild(sectionDomEl);
//     }
//     return postEl;
// }

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