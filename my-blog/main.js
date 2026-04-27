// ==============================
// 🔑 CONTENTFUL CREDENTIALS
// ==============================
const SPACE_ID = "x5ormmwomfoo";
const ACCESS_TOKEN = "j-im29W95IiWf1hKfhi7wTkiquv-LRBWBKc9Zx3XnRU";
const CONTENT_TYPE = "pageBlogPost";

// ==============================
// 📋 LOAD ALL BLOGS
// ==============================
async function loadAllBlogs() {
  await loadHardcodedBlogs();
  await loadCMSBlogs();
}

// ==============================
// 📌 HARDCODED BLOGS
// ==============================
async function loadHardcodedBlogs() {
  const res = await fetch("data/blogs.json");
  const blogs = await res.json();
  const container = document.getElementById("hardcoded-list");
  container.innerHTML = "";

  blogs.forEach(blog => {
    container.innerHTML += `
      <div class="blog-card">
        <div class="blog-card-img-wrapper">
          <img src="${blog.thumbnail}" alt="${blog.title}" class="blog-thumb"/>
          <span class="badge">${blog.category}</span>
        </div>
        <div class="blog-card-body">
          <h3 class="blog-card-title">${blog.title}</h3>
          <p class="blog-excerpt">${blog.excerpt}</p>
          <div class="blog-card-meta">
            <div class="author-info">
              <img src="${blog.authorImage}" class="author-avatar-sm" alt="${blog.author}"/>
              <span>${blog.author}</span>
            </div>
            <span class="meta-right">
              <span>📅 ${blog.date}</span>
              <span>⏱ ${blog.readTime}</span>
            </span>
          </div>
          <a href="blog-detail.html?type=hardcoded&id=${blog.id}" class="read-more-btn">
            Read More →
          </a>
        </div>
      </div>
    `;
  });
}

// ==============================
// 🌐 CMS BLOGS
// ==============================
async function loadCMSBlogs() {
  try {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=${CONTENT_TYPE}&order=-sys.createdAt&access_token=${ACCESS_TOKEN}`
    );
    const data = await res.json();
    const container = document.getElementById("cms-list");
    container.innerHTML = "";

    if (!data.items || data.items.length === 0) {
      container.innerHTML = "<p class='no-blogs'>No CMS blogs published yet.</p>";
      return;
    }

    data.items.forEach(post => {
      const fields = post.fields;
      container.innerHTML += `
        <div class="blog-card">
          <div class="blog-card-img-wrapper">
            <div class="cms-placeholder-img">📝</div>
            <span class="badge cms-badge">CMS</span>
          </div>
          <div class="blog-card-body">
            <h3 class="blog-card-title">${fields.title}</h3>
            <div class="blog-card-meta">
              <div class="author-info">
                <div class="author-avatar-placeholder">
                  ${(fields.authorName || "U")[0]}
                </div>
                <span>${fields.authorName || "Unknown"}</span>
              </div>
              <span class="meta-right">
                <span>📅 ${new Date(post.sys.createdAt).toDateString()}</span>
              </span>
            </div>
            <a href="blog-detail.html?type=cms&slug=${fields.slug}" class="read-more-btn cms-read-more">
              Read More →
            </a>
          </div>
        </div>
      `;
    });
  } catch (err) {
    document.getElementById("cms-list").innerHTML =
      "<p class='no-blogs'>Could not load CMS blogs. Check your credentials.</p>";
  }
}

// ==============================
// 📖 BLOG DETAIL
// ==============================
function loadBlogDetail() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");

  if (type === "hardcoded") {
    loadHardcodedDetail(params.get("id"));
  } else if (type === "cms") {
    loadCMSDetail(params.get("slug"));
  }
}

// ==============================
// 📌 HARDCODED DETAIL
// ==============================
async function loadHardcodedDetail(id) {
  const res = await fetch("data/blogs.json");
  const blogs = await res.json();
  const blog = blogs.find(b => b.id === parseInt(id));
  const container = document.getElementById("blog-detail");

  if (!blog) {
    container.innerHTML = "<p>Blog not found!</p>";
    return;
  }

  document.getElementById("page-title").innerText = blog.title;

  const bodyHTML = blog.body.map(block => {
    if (block.type === "paragraph") return `<p>${block.text}</p>`;
    if (block.type === "heading")   return `<h2>${block.text}</h2>`;
    return "";
  }).join("");

  container.innerHTML = `
    <div class="detail-hero">
      <img src="${blog.thumbnail}" alt="${blog.title}" class="detail-cover"/>
    </div>
    <div class="detail-content">
      <span class="badge">${blog.category}</span>
      <h1 class="detail-title">${blog.title}</h1>
      <div class="detail-meta">
        <div class="author-info">
          <img src="${blog.authorImage}" class="author-avatar" alt="${blog.author}"/>
          <div>
            <p class="author-name">${blog.author}</p>
            <p class="meta-date">${blog.date}</p>
          </div>
        </div>
        <span class="read-time-badge">⏱ ${blog.readTime}</span>
      </div>
      <hr class="detail-divider"/>
      <div class="detail-body">${bodyHTML}</div>
      <div class="cta-box">
        <h3>${blog.cta.title}</h3>
        <a href="${blog.cta.link}" class="cta-button">${blog.cta.buttonText}</a>
      </div>
    </div>
  `;
}

// ==============================
// 🌐 CMS DETAIL
// ==============================
async function loadCMSDetail(slug) {
  try {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=${CONTENT_TYPE}&fields.slug=${slug}&access_token=${ACCESS_TOKEN}`
    );
    const data = await res.json();
    const post = data.items[0];
    const fields = post.fields;
    const container = document.getElementById("blog-detail");

    document.getElementById("page-title").innerText = fields.title;

    const body = renderRichText(fields.body);
    const ctaHTML = fields.ctaTitle && fields.ctaLink ? `
      <div class="cta-box">
        <h3>${fields.ctaTitle}</h3>
        <a href="${fields.ctaLink}" class="cta-button">${fields.ctaTitle}</a>
      </div>
    ` : "";

    container.innerHTML = `
      <div class="detail-content">
        <span class="badge cms-badge">CMS</span>
        <h1 class="detail-title">${fields.title}</h1>
        <div class="detail-meta">
          <div class="author-info">
            <div class="author-avatar-placeholder large">
              ${(fields.authorName || "U")[0]}
            </div>
            <div>
              <p class="author-name">${fields.authorName || "Unknown"}</p>
              <p class="meta-date">${new Date(post.sys.createdAt).toDateString()}</p>
            </div>
          </div>
        </div>
        <hr class="detail-divider"/>
        <div class="detail-body">${body}</div>
        ${ctaHTML}
      </div>
    `;
  } catch (err) {
    document.getElementById("blog-detail").innerHTML =
      "<p>Could not load this blog post.</p>";
  }
}

// ==============================
// 🖊️ RENDER RICH TEXT
// ==============================
function renderRichText(body) {
  if (!body || !body.content) return "";
  return body.content.map(block => {
    const text = block.content?.map(t => t.value).join("") || "";
    if (block.nodeType === "paragraph") return `<p>${text}</p>`;
    if (block.nodeType === "heading-1") return `<h1>${text}</h1>`;
    if (block.nodeType === "heading-2") return `<h2>${text}</h2>`;
    if (block.nodeType === "heading-3") return `<h3>${text}</h3>`;
    if (block.nodeType === "hr")        return `<hr/>`;
    return "";
  }).join("");
}