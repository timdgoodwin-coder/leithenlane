#!/usr/bin/env node

/**
 * Leithen Lane — Programmatic SEO Blog Generator
 * 
 * Reads blog-data.json and generates:
 *   - /blog/index.html (listing page)
 *   - /blog/{slug}/index.html (individual post pages)
 * 
 * Usage: node generate-blog.js
 */

const fs = require('fs');
const path = require('path');

const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog-data.json'), 'utf-8'));
const blogDir = path.join(__dirname, 'blog');

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const GA_TAG = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-79K70YMPTB"><\/script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-79K70YMPTB');
  <\/script>`;

// ─── Shared HTML fragments ─────────────────────────────────────────────────

const NAV = `
  <nav class="nav" id="nav" role="navigation" aria-label="Main navigation">
    <div class="container nav__inner">
      <a href="/" class="nav__logo" aria-label="Leithen Lane home">Leithen <span>Lane</span></a>
      <ul class="nav__links" id="nav-links" role="list">
        <li><a href="/#about" class="nav__link">About</a></li>
        <li><a href="/#services" class="nav__link">Services</a></li>
        <li><a href="/#process" class="nav__link">How It Works</a></li>
        <li><a href="/blog" class="nav__link nav__link--active">Blog</a></li>
        <li><a href="/#contact" class="nav__link">Contact</a></li>
        <li><a href="/#contact" class="btn btn--primary nav__cta" id="nav-cta">Book a Free Call</a></li>
      </ul>
      <button class="nav__toggle" id="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </nav>`;

const FOOTER = `
  <footer class="footer" id="footer" role="contentinfo">
    <div class="container">
      <div class="footer__inner">
        <div class="footer__logo">Leithen <span>Lane</span></div>
        <ul class="footer__links" role="list">
          <li><a href="/#about" class="footer__link">About</a></li>
          <li><a href="/#services" class="footer__link">Services</a></li>
          <li><a href="/#process" class="footer__link">How It Works</a></li>
          <li><a href="/blog" class="footer__link">Blog</a></li>
          <li><a href="/#contact" class="footer__link">Contact</a></li>
        </ul>
      </div>
      <div class="footer__bottom">
        <p>&copy; 2026 Leithen Lane. All rights reserved.</p>
        <p class="footer__email"><a href="mailto:sam@leithenlane.com">sam@leithenlane.com</a></p>
      </div>
    </div>
  </footer>`;

const MOBILE_NAV_JS = `
  <script>
    // Mobile nav toggle (same as main site)
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        links.classList.toggle('nav__links--open');
      });
    }
    // Sticky nav
    const nav = document.getElementById('nav');
    if (nav) {
      let lastY = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('nav--scrolled', y > 40);
        lastY = y;
      }, { passive: true });
    }
  </script>`;

// ─── Article structured data (JSON-LD) ─────────────────────────────────────

function articleSchema(post) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription,
    "author": {
      "@type": "Person",
      "name": "Samantha Goodwin",
      "url": "https://leithenlane.com/#about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Leithen Lane",
      "url": "https://leithenlane.com"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": `https://leithenlane.com/blog/${post.slug}/`,
    "keywords": post.keyword
  });
}

// ─── Blog listing schema ───────────────────────────────────────────────────

function blogListingSchema(posts) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Leithen Lane Blog",
    "description": "Practical e-commerce operations advice for startups, from someone who's been in the trenches.",
    "url": "https://leithenlane.com/blog/",
    "publisher": {
      "@type": "Organization",
      "name": "Leithen Lane",
      "url": "https://leithenlane.com"
    },
    "blogPost": posts.map(p => ({
      "@type": "BlogPosting",
      "headline": p.title,
      "url": `https://leithenlane.com/blog/${p.slug}/`,
      "datePublished": p.date,
      "author": { "@type": "Person", "name": "Samantha Goodwin" }
    }))
  });
}

// ─── Generate individual post page ─────────────────────────────────────────

function generatePost(post) {
  const contentHTML = post.sections.map(s => {
    let html = '';
    if (s.heading) {
      html += `\n          <h2>${s.heading}</h2>`;
    }
    html += `\n          ${s.content}`;
    return html;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | Leithen Lane</title>
  <meta name="description" content="${post.metaDescription}">
  <meta name="keywords" content="${post.keyword}, e-commerce consultancy, ecommerce operations, Leithen Lane">
  <meta name="author" content="Samantha Goodwin">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.metaDescription}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://leithenlane.com/blog/${post.slug}/">
  <link rel="canonical" href="https://leithenlane.com/blog/${post.slug}/">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>">
  <link rel="stylesheet" href="/index.css">
  <link rel="stylesheet" href="/blog.css">
  <script type="application/ld+json">${articleSchema(post)}</script>
  ${GA_TAG}
</head>
<body>
  ${NAV}

  <article class="blog-post" id="blog-post">
    <header class="blog-post__header">
      <div class="container">
        <a href="/blog" class="blog-post__back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back to Blog
        </a>
        <div class="blog-post__meta">
          <span class="blog-post__category">${post.category}</span>
          <span class="blog-post__separator">·</span>
          <time class="blog-post__date" datetime="${post.date}">${formatDate(post.date)}</time>
          <span class="blog-post__separator">·</span>
          <span class="blog-post__read-time">${post.readTime}</span>
        </div>
        <h1 class="blog-post__title">${post.title}</h1>
        <div class="blog-post__author">
          <img src="/samportrait3.jpg" alt="Samantha Goodwin" class="blog-post__avatar" loading="lazy">
          <div>
            <div class="blog-post__author-name">Samantha Goodwin</div>
            <div class="blog-post__author-role">Founder, Leithen Lane</div>
          </div>
        </div>
      </div>
    </header>

    <div class="blog-post__body">
      <div class="container container--narrow">
        <div class="blog-post__content">
          ${contentHTML}
        </div>

        <div class="blog-post__cta">
          <div class="blog-post__cta-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <p>${post.cta}</p>
            <a href="/#contact" class="btn btn--primary">Book a Free Consultation</a>
          </div>
        </div>
      </div>
    </div>
  </article>

  ${FOOTER}
  ${MOBILE_NAV_JS}
</body>
</html>`;
}

// ─── Generate blog index / listing page ────────────────────────────────────

function generateIndex(posts) {
  const cardsHTML = posts.map(post => `
        <a href="/blog/${post.slug}/" class="blog-card" id="blog-card-${post.slug}">
          <div class="blog-card__category">${post.category}</div>
          <h2 class="blog-card__title">${post.title}</h2>
          <p class="blog-card__excerpt">${post.metaDescription}</p>
          <div class="blog-card__footer">
            <time class="blog-card__date" datetime="${post.date}">${formatDate(post.date)}</time>
            <span class="blog-card__read-time">${post.readTime}</span>
          </div>
        </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Practical E-commerce Operations Advice | Leithen Lane</title>
  <meta name="description" content="Practical e-commerce operations advice for startups. Covering Shopify, Klaviyo, Recharge, fulfilment, and scaling — from someone who's been in the trenches.">
  <meta name="keywords" content="e-commerce blog, ecommerce operations advice, Shopify tips, DTC startup blog">
  <meta name="author" content="Samantha Goodwin">
  <meta property="og:title" content="Blog | Leithen Lane">
  <meta property="og:description" content="Practical e-commerce operations advice for startups, from someone who's been in the trenches.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://leithenlane.com/blog/">
  <link rel="canonical" href="https://leithenlane.com/blog/">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>">
  <link rel="stylesheet" href="/index.css">
  <link rel="stylesheet" href="/blog.css">
  <script type="application/ld+json">${blogListingSchema(posts)}</script>
  ${GA_TAG}
</head>
<body>
  ${NAV}

  <section class="blog-hero" id="blog-hero">
    <div class="container">
      <span class="section__label">Blog</span>
      <h1 class="blog-hero__title">Practical advice for e-commerce operators</h1>
      <p class="blog-hero__subtitle">Real talk about Shopify, Klaviyo, fulfilment, subscriptions, and everything else that keeps your e-commerce business running. No fluff, no theory — just what actually works.</p>
    </div>
  </section>

  <section class="blog-listing" id="blog-listing">
    <div class="container">
      <div class="blog-listing__grid">
${cardsHTML}
      </div>
    </div>
  </section>

  <section class="cta-banner" id="cta-banner">
    <div class="container">
      <div class="cta-banner__content">
        <h2>Need hands-on help, not just advice?</h2>
        <p>These posts give you the what and why. If you need someone to actually do it with you, let's talk.</p>
        <a href="/#contact" class="btn btn--white btn--large" id="blog-cta">
          Book Your Free Call
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </section>

  ${FOOTER}
  ${MOBILE_NAV_JS}
</body>
</html>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

console.log('🌿 Leithen Lane Blog Generator');
console.log('─'.repeat(40));

// Create blog directory
ensureDir(blogDir);

// Generate index
const indexHTML = generateIndex(posts);
fs.writeFileSync(path.join(blogDir, 'index.html'), indexHTML);
console.log(`✓ blog/index.html`);

// Generate individual posts
posts.forEach(post => {
  const postDir = path.join(blogDir, post.slug);
  ensureDir(postDir);
  const postHTML = generatePost(post);
  fs.writeFileSync(path.join(postDir, 'index.html'), postHTML);
  console.log(`✓ blog/${post.slug}/index.html`);
});

console.log('─'.repeat(40));
console.log(`✅ Generated ${posts.length} blog posts + index page`);
