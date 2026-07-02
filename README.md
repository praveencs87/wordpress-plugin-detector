# WordPress Plugin & Theme Detector

**Instantly detect the active WordPress theme and plugins used on any website. Essential for competitor analysis and lead generation.**

Ever wonder what WordPress theme a beautiful website is using? Or exactly which plugins they are running to achieve a specific functionality? This high-speed actor scans the source code of any WordPress site to reveal its entire tech stack in seconds.

## What can this Actor do?

- ✅ **Plugin Extraction** - Detects exactly which plugins are installed by scanning script, link, and image paths (e.g., Elementor, WooCommerce, Yoast SEO).
- ✅ **Theme Detection** - Finds the active WordPress theme slug (e.g., Astra, Divi, custom-theme).
- ✅ **Version Detection** - Automatically extracts the WordPress core version (e.g., WordPress 6.4.2) if exposed in the metadata.
- ✅ **Deep Crawling** - Option to scan internal pages (up to 5) to catch hidden plugins that only load on specific routes (like checkout pages).
- ✅ **Bulk Analysis** - Feed it a list of 1,000 domains and it will scan all of them in minutes using a high-speed HTML parser (no heavy browser overhead).

## Why detect plugins and themes?

- 🎯 **Lead Generation** - Sell a competitor plugin? Find every website currently using your competitor's plugin and pitch them your alternative!
- 📊 **Competitor Intelligence** - Spy on your competitors to see exactly how they built their website's functionality.
- 📍 **Security Audits** - Quickly check a list of client websites to see if any are running outdated, vulnerable WordPress versions.

## How to use it

1. Enter a list of website URLs in the **URLs to Scan** field.
2. Toggle **Deep Crawl** if you want it to scan a few internal pages to catch conditionally-loaded plugins (slightly slower but more accurate).
3. Click Start!

## How much does it cost?

This actor uses a **Pay-Per-Event (PPE)** pricing model. You only pay for the websites successfully analyzed!
- **$0.20 per 1,000 websites analyzed.**

## Output Example

```json
{
  "domain": "techcrunch.com",
  "isWordPress": true,
  "wpVersion": "WordPress 6.4.2",
  "theme": "techcrunch-2017",
  "plugins": [
    "jetpack",
    "wp-seo",
    "ad-manager",
    "contact-form-7"
  ],
  "scrapedAt": "2023-10-25T15:00:00.000Z"
}
```
