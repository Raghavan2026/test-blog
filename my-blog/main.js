// ==============================
// 🔑 CONTENTFUL CREDENTIALS
// ==============================
const SPACE_ID = "x5ormmwomfoo";
const ACCESS_TOKEN = "j-im29W95IiWf1hKfhi7wTkiquv-LRBWBKc9Zx3XnRU";
const CONTENT_TYPE = "pageBlogPost";

// ==============================
// 📋 LOAD ALL BLOGS (index.html)
// ==============================
async function loadAllBlogs() {
  await loadHardcodedBlogs();
  await loadCMSBlogs();
}

// ==============================
// 📌 LOAD HARDCODED BLOGS
// ==============================
async function loadHardcodedBlogs() {
  try {
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
  } catch (err) {
    console.error("Hardcoded blogs error:", err);
    document.getElementById("hardcoded-list").innerHTML =
      "<p class='no-blogs'>Could not load articles.</p>";
  }
}

// ==============================
// 🌐 LOAD CMS BLOGS
// ==============================
async function loadCMSBlogs() {
  try {
   const res = await fetch("/api/cms-blogs"); // Your own backend endpoint
    const data = await res.json();
    const container = document.getElementById("cms-list");
    container.innerHTML = "";

    if (!data.items || data.items.length === 0) {
      container.innerHTML = "<p class='no-blogs'>No CMS blogs published yet.</p>";
      return;
    }

    data.items.forEach(post => {
      const fields = post.fields;
      const authorName = fields.authorName || fields.author || "Unknown";
      const date = new Date(post.sys.createdAt).toDateString();

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
                  ${(authorName)[0].toUpperCase()}
                </div>
                <span>${authorName}</span>
              </div>
              <span class="meta-right">
                <span>📅 ${date}</span>
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
    console.error("CMS blogs error:", err);
    document.getElementById("cms-list").innerHTML =
      "<p class='no-blogs'>Could not load CMS blogs. Check your credentials.</p>";
  }
}

// ==============================
// 📖 BLOG DETAIL — DECIDES TYPE
// ==============================
function loadBlogDetail() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");

  if (type === "hardcoded") {
    loadHardcodedDetail(params.get("id"));
  } else if (type === "cms") {
    loadCMSDetail(params.get("slug"));
  } else {
    document.getElementById("blog-detail").innerHTML =
      "<p>Blog not found. Please go back and try again.</p>";
  }
}

// ==============================
// 📌 HARDCODED BLOG DETAIL
// ==============================
async function loadHardcodedDetail(id) {
  try {
    const res = await fetch("data/blogs.json");
    const blogs = await res.json();
    const blog = blogs.find(b => b.id === parseInt(id));
    const container = document.getElementById("blog-detail");

    if (!blog) {
      container.innerHTML = "<p>Blog not found!</p>";
      return;
    }

    // Set page title
    document.getElementById("page-title").innerText = blog.title;

    // Build body HTML
    const bodyHTML = blog.body.map(block => {
      if (block.type === "paragraph") return `<p>${block.text}</p>`;
      if (block.type === "heading")   return `<h2>${block.text}</h2>`;
      return "";
    }).join("");

    // Build CTA HTML
    const ctaHTML = blog.cta ? `
      <div class="cta-box">
        <h3>${blog.cta.title}</h3>
        <a href="${blog.cta.link}" class="cta-button">${blog.cta.buttonText}</a>
      </div>
    ` : "";

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
        ${ctaHTML}
      </div>
    `;
  } catch (err) {
    console.error("Hardcoded detail error:", err);
    document.getElementById("blog-detail").innerHTML =
      "<p>Could not load this blog post.</p>";
  }
}

// ==============================
// 🌐 CMS BLOG DETAIL
// ==============================
async function loadCMSDetail(slug) {
  try {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=${CONTENT_TYPE}&fields.slug=${slug}&access_token=${ACCESS_TOKEN}`
    );
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      document.getElementById("blog-detail").innerHTML =
        "<p>Blog not found!</p>";
      return;
    }

    const post = data.items[0];
    const fields = post.fields;
    const container = document.getElementById("blog-detail");

    // ✅ Console log to check field names
    console.log("All fields from Contentful:", fields);

    // Set page title
    document.getElementById("page-title").innerText = fields.title;

    // ✅ Try all possible body field names
    const bodyData =
      fields.body ||
      fields.content ||
      fields.blogBody ||
      fields.description ||
      null;

    console.log("Body data found:", bodyData);

    // Render body
    const body = bodyData
      ? renderRichText(bodyData)
      : "<p>No content available for this blog.</p>";

    // Author
    const authorName =
      fields.authorName ||
      fields.author ||
      "Unknown";

    // Date
    const date = new Date(post.sys.createdAt).toDateString();

    // CTA
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
              ${authorName[0].toUpperCase()}
            </div>
            <div>
              <p class="author-name">${authorName}</p>
              <p class="meta-date">${date}</p>
            </div>
          </div>
        </div>
        <hr class="detail-divider"/>
        <div class="detail-body">${body}</div>
        ${ctaHTML}
      </div>
    `;
  } catch (err) {
    console.error("CMS detail error:", err);
    document.getElementById("blog-detail").innerHTML =
      "<p>Could not load this blog post. Please try again.</p>";
  }
}

// ==============================
// 🖊️ RENDER RICH TEXT
// ==============================
function renderRichText(body) {
  if (!body) return "<p>No content available.</p>";
  if (!body.content) return "<p>No content available.</p>";

  return body.content.map(block => {

    // PARAGRAPH
    if (block.nodeType === "paragraph") {
      const text = block.content?.map(node => {
        if (node.nodeType === "text") {
          let val = node.value;
          if (node.marks) {
            node.marks.forEach(mark => {
              if (mark.type === "bold")   val = `<strong>${val}</strong>`;
              if (mark.type === "italic") val = `<em>${val}</em>`;
              if (mark.type === "code")   val = `<code>${val}</code>`;
            });
          }
          return val;
        }
        return "";
      }).join("") || "";
      return text ? `<p>${text}</p>` : "";
    }

    // HEADINGS
    if (block.nodeType === "heading-1") {
      const text = block.content?.map(n => n.value).join("") || "";
      return `<h1>${text}</h1>`;
    }
    if (block.nodeType === "heading-2") {
      const text = block.content?.map(n => n.value).join("") || "";
      return `<h2>${text}</h2>`;
    }
    if (block.nodeType === "heading-3") {
      const text = block.content?.map(n => n.value).join("") || "";
      return `<h3>${text}</h3>`;
    }
    if (block.nodeType === "heading-4") {
      const text = block.content?.map(n => n.value).join("") || "";
      return `<h4>${text}</h4>`;
    }

    // UNORDERED LIST
    if (block.nodeType === "unordered-list") {
      const items = block.content?.map(item => {
        const text = item.content?.[0]?.content?.map(n => n.value).join("") || "";
        return `<li>${text}</li>`;
      }).join("") || "";
      return `<ul>${items}</ul>`;
    }

    // ORDERED LIST
    if (block.nodeType === "ordered-list") {
      const items = block.content?.map(item => {
        const text = item.content?.[0]?.content?.map(n => n.value).join("") || "";
        return `<li>${text}</li>`;
      }).join("") || "";
      return `<ol>${items}</ol>`;
    }

    // BLOCKQUOTE
    if (block.nodeType === "blockquote") {
      const text = block.content?.[0]?.content?.map(n => n.value).join("") || "";
      return `<blockquote>${text}</blockquote>`;
    }

    // HORIZONTAL RULE
    if (block.nodeType === "hr") return `<hr/>`;

    // EMBEDDED ASSET (images inside blog)
    if (block.nodeType === "embedded-asset-block") {
      const assetId = block.data?.target?.sys?.id;
      if (assetId) {
        return `<div class="embedded-image-placeholder">📷 Image (ID: ${assetId})</div>`;
      }
      return "";
    }

    return "";
  }).join("");
}