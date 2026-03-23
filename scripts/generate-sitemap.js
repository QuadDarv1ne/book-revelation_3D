#!/usr/bin/env node

/**
 * Генерация sitemap.xml для SEO
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://book-revelation-3d.vercel.app';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

const pages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/webgl-test', priority: 0.5, changefreq: 'monthly' },
];

function generateSitemap() {
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log(`✅ Sitemap создан: ${OUTPUT_PATH}`);
}

generateSitemap();
