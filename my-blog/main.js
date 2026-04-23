// ==============================
// 🔑 YOUR CONTENTFUL CREDENTIALS
// ==============================
const SPACE_ID = "x5ormmwomfoo";
const ACCESS_TOKEN = "j-im29W95IiWf1hKfhi7wTkiquv-LRBWBKc9Zx3XnRU";
const CONTENT_TYPE = "pageBlogPost"; // ← check this in your Contentful Content Model

// ==============================
// 📋 LOAD ALL BLOGS (index.html)
// ==============================
async function loadAllBlogs() {
  const res = await fetch(
    `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=${CONTENT_TYPE}&order=-sys.createdAt&access_token=${ACCESS_TOKEN}`
  );
  const data = await res.json();
  const container = document.getElementById("blog-list");
  container.innerHTML = "";

  if (data.items.length === 0) {
    container.innerHTML = "<p>No blogs found.</p>";
    return;
  }

  data.items.forEach(post => {
    const slug = post.fields.slug;
    const title = post.fields.title;
    const date = new Date(post.sys.createdAt).toDateString();

    container.innerHTML += `
      <div class="blog-card">
        <h2>${title}</h2>
        <p class="date">${date}</p>
        <a href="blog.html?slug=${slug}">Read More →</a>
      </div>
    `;
  });
}

// ==============================
// 📖 LOAD SINGLE BLOG (blog.html)
// ==============================
async function loadSingleBlog() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const res = await fetch(
    `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=${CONTENT_TYPE}&fields.slug=${slug}&access_token=${ACCESS_TOKEN}`
  );
  const data = await res.json();
  const post = data.items[0];
  const container = document.getElementById("blog-detail");

  const title = post.fields.title;
  const date = new Date(post.sys.createdAt).toDateString();
  const body = renderRichText(post.fields.body);

  container.innerHTML = `
    <h1>${title}</h1>
    <p class="date">${date}</p>
    <hr/>
    <div class="blog-body">${body}</div>
  `;
}

// ==============================
// 🖊️ RENDER RICH TEXT BODY
// ==============================
function renderRichText(body) {
  if (!body || !body.content) return "<p>No content found.</p>";

  return body.content.map(block => {
    const text = block.content?.map(t => t.value).join("") || "";

    if (block.nodeType === "paragraph")  return `<p>${text}</p>`;
    if (block.nodeType === "heading-1")  return `<h1>${text}</h1>`;
    if (block.nodeType === "heading-2")  return `<h2>${text}</h2>`;
    if (block.nodeType === "heading-3")  return `<h3>${text}</h3>`;
    if (block.nodeType === "hr")         return `<hr/>`;
    return "";
  }).join("");
}