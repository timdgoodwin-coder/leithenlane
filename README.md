# Leithen Lane — leithenlane.com

E-commerce operations consultancy website for startups. Built with vanilla HTML/CSS/JS.

## Quick Start

Open `index.html` in your browser to preview locally.

## Deployment

This site is deployed on **Vercel**:

1. Push to GitHub
2. Connect repo to Vercel
3. Vercel will auto-deploy (no build step needed — it's static HTML)

## Contact Form Setup

The contact form uses **Formspree** for form submission:

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form
3. Copy your form endpoint (e.g., `https://formspree.io/f/xyzabc`)
4. Replace `placeholder` in `index.html` on this line:
   ```html
   <form class="form" id="contact-form" action="https://formspree.io/f/placeholder" method="POST">
   ```
5. Set the email recipient to `sam@leithenlane.com` in Formspree settings

## Project Structure

```
├── index.html          # Main page
├── index.css           # Design system & styles
├── index.js            # Navigation, animations, form handling
├── vercel.json         # Vercel deployment config
├── gemini.md           # Project constitution
├── architecture/       # Technical SOPs
├── task_plan.md        # Project task plan
├── findings.md         # Research & discoveries
└── progress.md         # Progress tracking
```

## Design System

- **Colors:** Deep Forest Green (#2D5F3E) + Warm Gold (#C4A265) + Warm Off-White (#FAFAF7)
- **Typography:** DM Serif Display (headings) + Inter (body)
- **Pattern:** Trust & Authority + Conversion-Optimized
- **Style:** Clean, professional, warm — not corporate

## License

All rights reserved © 2026 Leithen Lane
