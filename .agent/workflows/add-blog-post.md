---
description: How to add a new blog post to the Leithen Lane site
---

# Adding a New Blog Post

// turbo-all

## Steps

1. Open `blog-data.json` in the project root.

2. Add a new entry to the JSON array with this structure:

```json
{
  "slug": "your-url-slug",
  "title": "Your Post Title",
  "metaDescription": "A compelling 155-character meta description for search results.",
  "keyword": "target long-tail keyword",
  "category": "Category Name",
  "date": "YYYY-MM-DD",
  "readTime": "X min read",
  "sections": [
    {
      "content": "<p>Intro paragraph (no heading for the first section).</p>"
    },
    {
      "heading": "Section Heading",
      "content": "<p>Section content with HTML formatting.</p><ul><li>List items</li></ul>"
    }
  ],
  "cta": "Closing call-to-action text. Should mention booking a free consultation."
}
```

3. Run the blog generator:

```bash
node generate-blog.js
```

This regenerates ALL blog pages (index + individual posts) from the JSON data.

4. Preview locally:

```bash
npx -y serve -l 3456 .
```

Then visit `http://localhost:3456/blog/` to check the listing, and `http://localhost:3456/blog/your-url-slug/` to check the post.

5. Commit and push to deploy:

```bash
git add blog/ blog-data.json
git commit -m "Add blog post: your-post-title"
git push origin main
```

## Notes

- **Content is HTML**: The `content` field in each section accepts raw HTML. Use `<p>`, `<ul>`, `<ol>`, `<strong>`, `<em>`, `<table>`, etc.
- **First section**: Should NOT have a `heading` — it's the intro paragraph.
- **Categories used so far**: Systems & Integration, Fulfilment & Logistics, Commercial & Profitability, Customer Experience, Scaling Operations.
- **Slug format**: lowercase, hyphen-separated, no trailing slash (e.g. `my-new-post`).
- **Images**: Not currently supported in blog posts. If needed, add an `image` field to the JSON schema and update `generate-blog.js`.
- **CSS**: Blog styles live in `blog.css` — extends the main `index.css` design system.
