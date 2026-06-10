# SurtAI site — code review & fixes

Reviewed: `index.html`, `assets/css/main.css`, `assets/js/main.js`.
All changes described below have been **applied** to the files in this bundle. New files added: `assets/css/no-js.css`, `_headers`, `robots.txt`, `sitemap.xml`.

---

## ⚠️ One thing to confirm

**Pricing figure.** The site previously showed two different INR amounts: the visible FAQ said **₹2,75,000** while the FAQ structured data said **₹2,50,000**. I standardised everything on the value already shown to visitors (**₹2,75,000**) so the hidden schema now agrees with the page. If the correct number is actually ₹2,50,000, change it in two places: the visible FAQ answer ("How much does a project cost?") and the matching `FAQPage` JSON-LD block in `<head>`. The two must always match — see the SEO note below.

---

## What was fixed

### Real bugs
- **Invalid `</br>` closing tags** in four FAQ answers and one `<h2>`. `<br>` is a void element with no closing tag; browsers parse each `</br>` as *another* line break, so you were getting stray extra spacing. The FAQ answers are now clean multi-paragraph `<p>` blocks; the heading uses a single `<br>`.
- **Logo aspect ratio.** The `<img>` declared `width="1200" height="355"` but the file is `961×355`. Corrected to `961×355` so the browser reserves the right box and avoids layout shift (CLS).
- **Ambiguous ampersands** in the Google Fonts URL (`&family`, `&display`) and the mailto link (`&body`) are now `&amp;`. Browsers decode these back to `&`, so the links behave identically — but the page now passes strict HTML5 validation.

### SEO / structured data
- **FAQ schema now matches the visible copy** word-for-word. Google requires `FAQPage` structured data to mirror on-page text; the previous version had different wording (and the INR mismatch above), which risks the rich result being dropped or flagged. The questions and answers are now generated from the same source.
- **Added** a `<link rel="canonical">`, `og:image` (+ dimensions/alt), `og:site_name`, and a full Twitter Card block. Favicon / `apple-touch-icon` links added.
- **Added** `robots.txt` and `sitemap.xml` (single-page sitemap pointing at the homepage).

### Accessibility
- **FAQ accordion is now properly wired**: each question button has `id` + `aria-controls`, and each answer panel has a matching `id` + `aria-labelledby`. Screen readers now announce the relationship and the panel has an accessible name (it previously had `role="region"` with no name).
- **No-JS fallback.** The FAQ answers are collapsed by CSS and opened by JS, so with JavaScript disabled they were invisible to users. A `<noscript>`-loaded stylesheet (`assets/css/no-js.css`) now reveals all answers when JS is off. (The content was always in the DOM for crawlers; this is for human/AT users without JS.)
- Programmatic smooth-scroll now respects `prefers-reduced-motion` and updates the URL hash (so deep links and the browser back button work).

### Security (headers handled via Cloudflare Pages `_headers`)
The HTML/JS was already clean — no `innerHTML` with user input, the Vimeo ID and lazy-load values are developer-controlled, and the external link uses `rel="noopener noreferrer"`. The remaining hardening is at the HTTP layer, now provided in `_headers`:

- **Content-Security-Policy** — strict `script-src 'self'` (the page has no inline scripts or `on*=` handlers; the JSON-LD blocks are non-executable data and aren't covered by `script-src`). To enable this, all inline `style="…"` attributes were removed and replaced with CSS classes (`.wrap h2`, `.mb-4/8/10`), so `style-src` also drops `'unsafe-inline'` and only allows Google Fonts. `frame-src` permits the Vimeo player.
- **Strict-Transport-Security**, **X-Frame-Options: DENY** (+ CSP `frame-ancestors 'none'`), **X-Content-Type-Options: nosniff**, **Referrer-Policy**, **Cross-Origin-Opener-Policy**, and a **Permissions-Policy** that disables unused sensors but allows autoplay/fullscreen/PiP for the Vimeo showreel.
- A conservative `Cache-Control` for `/assets/*` (1 day + revalidate), with a note in the file on raising it once filenames are content-hashed.

Note: HSTS is set without `preload`. Only add `; preload` and submit to hstspreload.org once you're certain every subdomain will be HTTPS-only — it's hard to undo.

### Cleanup
- Removed **dead CSS** for sections that no longer exist in the stealth page: `.hero-img`, `.work-cta`/`.work-cta-line`, the entire ABOUT block (`.founder-*`, `.pullquote`, `.channel-*`, `.ch-*`), and `.contact-card-alt`. All were verified unused in the HTML. No behaviour change; smaller stylesheet.

---

## Placeholders left in place (as requested)

These are intentionally still placeholders — fill them before launch:

1. **Vimeo ID** — `data-vimeo-id="VIMEO_ID"` on the hero video. Until a real numeric ID is set, the play button does nothing (by design).
2. **Calendly URL** — `https://calendly.com/your-link-here` in the contact section.
3. **Image assets** referenced but not verified present:
   - `assets/img/SurtAI_Logo_Transparent_Background_961x355.png` (logo)
   - `assets/img/hero-poster.jpg` (1920×1080 hero poster)
   - `assets/img/og-image.jpg` (**1200×630** social share image — new)
   - `favicon.ico`, `assets/img/favicon.svg`, `assets/img/apple-touch-icon.png` (**new** — add these or remove the favicon links)

Also worth confirming: the live domain (`surtaistudio.com` is hard-coded in canonical/OG/sitemap/schema), the phone number, and `foundingDate: "2026"`.

---

## Pre-launch checklist

- [ ] Confirm the INR price (see top) and that schema + visible copy still match.
- [ ] Add the real Vimeo ID and Calendly URL.
- [ ] Add all image assets listed above (or remove the favicon links if not using them).
- [ ] Confirm the production domain in canonical/OG/sitemap.
- [ ] Deploy and run the page through a CSP report check — if the Vimeo player ever fails to load, the most likely cause is `frame-src`; broaden to `https://*.vimeo.com` if needed.
- [ ] Test the live URL in Google's Rich Results Test for the FAQ markup.
- [ ] Verify the page with JS disabled (FAQ answers should all be visible).

---

## Files in this bundle

| File | Status |
|------|--------|
| `index.html` | edited |
| `assets/css/main.css` | edited |
| `assets/js/main.js` | edited |
| `assets/css/no-js.css` | new |
| `_headers` | new (Cloudflare Pages) |
| `robots.txt` | new |
| `sitemap.xml` | new |
