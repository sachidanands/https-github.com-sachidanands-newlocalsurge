import fs from 'fs';
import path from 'path';
import { BLOG_POSTS } from '../src/data/blogData';

const REVISED_SLUGS = new Set([
  'top-on-page-seo-mistakes-local-businesses-make',
  '10-second-website-hack-why-meta-titles-matter',
  'why-canonical-link-tag-checker-is-essential-for-local-seo',
  'why-image-alt-tag-accessibility-scanner-is-essential-for-local-seo',
  'why-your-website-jumps-cls-guide',
  'why-google-pagespeed-insights-matters-for-local-seo',
  'fix-duplicate-overlong-meta-descriptions',
  'seo-url-spaces-uppercase-parameters',
  'robots-txt-noindex-internal-search-pages',
  'fix-internal-external-4xx-errors',
  'html-document-over-2mb-googlebot',
  'website-security-headers-local-business',
  'improve-thin-content-readability-service-pages',
  'high-external-outlinks-seo-audit'
]);

function formatXmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateBlogSitemap(): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const post of BLOG_POSTS) {
    const isRevised = REVISED_SLUGS.has(post.slug);
    const lastmod = isRevised ? '2026-10-24' : '2026-08-30';
    const postUrl = `https://localsurgeseo.com/blog/${post.slug}`;
    const imgUrl = post.image.startsWith('http')
      ? post.image
      : `https://localsurgeseo.com${post.image}`;

    xml += `  <url>
    <loc>${postUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="en-US" href="${postUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${postUrl}" />
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${formatXmlEscape(post.title)}</image:title>
    </image:image>
  </url>
`;
  }

  xml += `</urlset>\n`;
  return xml;
}

// Write public/sitemap-blog.xml
const sitemapBlogPath = path.join(process.cwd(), 'public', 'sitemap-blog.xml');
fs.writeFileSync(sitemapBlogPath, generateBlogSitemap(), 'utf8');
console.log(`✔ Generated public/sitemap-blog.xml with ${BLOG_POSTS.length} URLs.`);

// Update sitemap_index.xml with updated date
const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap_index.xml');
if (fs.existsSync(sitemapIndexPath)) {
  let indexContent = fs.readFileSync(sitemapIndexPath, 'utf8');
  indexContent = indexContent.replace(
    /<loc>https:\/\/localsurgeseo\.com\/sitemap-blog\.xml<\/loc>\s*<lastmod>[^<]+<\/lastmod>/,
    `<loc>https://localsurgeseo.com/sitemap-blog.xml</loc>\n    <lastmod>2026-10-24</lastmod>`
  );
  fs.writeFileSync(sitemapIndexPath, indexContent, 'utf8');
  console.log(`✔ Updated public/sitemap_index.xml lastmod for sitemap-blog.xml to 2026-10-24.`);
}

// Synchronize public/sitemap.xml
const sitemapAllPath = path.join(process.cwd(), 'public', 'sitemap.xml');
if (fs.existsSync(sitemapAllPath)) {
  let allContent = fs.readFileSync(sitemapAllPath, 'utf8');
  
  // Extract all non-blog entries from sitemap.xml
  const nonBlogUrls: string[] = [];
  const urlRegex = /<url>[\s\S]*?<\/url>/g;
  let match;
  while ((match = urlRegex.exec(allContent)) !== null) {
    const chunk = match[0];
    if (!chunk.includes('<loc>https://localsurgeseo.com/blog/')) {
      nonBlogUrls.push(chunk);
    }
  }

  // Build combined sitemap.xml
  let combinedXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  nonBlogUrls.forEach(u => {
    combinedXml += `  ${u.trim()}\n`;
  });

  for (const post of BLOG_POSTS) {
    const isRevised = REVISED_SLUGS.has(post.slug);
    const lastmod = isRevised ? '2026-10-24' : '2026-08-30';
    const postUrl = `https://localsurgeseo.com/blog/${post.slug}`;
    const imgUrl = post.image.startsWith('http')
      ? post.image
      : `https://localsurgeseo.com${post.image}`;

    combinedXml += `  <url>
    <loc>${postUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="en-US" href="${postUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${postUrl}" />
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${formatXmlEscape(post.title)}</image:title>
    </image:image>
  </url>
`;
  }

  combinedXml += `</urlset>\n`;
  fs.writeFileSync(sitemapAllPath, combinedXml, 'utf8');
  console.log(`✔ Synchronized public/sitemap.xml with ${nonBlogUrls.length} core pages + ${BLOG_POSTS.length} blog posts.`);
}
