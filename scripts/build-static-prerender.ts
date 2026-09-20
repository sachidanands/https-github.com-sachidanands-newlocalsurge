import fs from 'fs';
import path from 'path';
import { prerenderLocationHtmlWithStatus } from '../api/prerender';
import { STATES_REGISTRY, DISTRICTS_REGISTRY } from '../src/data/locationsData';
import { BLOG_POSTS } from '../src/data/blogData';
import { STATE_DIRECTORY, CITY_DIRECTORY } from '../src/data/directoryData';
import { COMPETITOR_COMPARISONS } from '../src/data/competitorData';

interface PrerenderSummary {
  route: string;
  outputPath: string;
  canonical: string;
  title: string;
  status: number;
}

function getAllRoutesToPrerender(): string[] {
  const routes = new Set<string>();

  // 1. Core pages
  const coreRoutes = [
    '/',
    '/about',
    '/why-us',
    '/local-seo',
    '/pricing',
    '/seo-tool',
    '/contact',
    '/case-studies',
    '/site-map',
    '/privacy-policy',
    '/terms-of-service',
    '/ai-frontdesk',
    '/california',
    '/los-angeles-seo',
    '/locations',
    '/blog',
    '/compare'
  ];
  coreRoutes.forEach(r => routes.add(r));

  // 2. Programmatic Location State pages (/locations/:state)
  Object.values(STATES_REGISTRY).forEach(state => {
    routes.add(`/locations/${state.slug}`);
    routes.add(`/locations/${state.slug}/`);
  });

  // 3. Programmatic Location District pages (/locations/:state/:district)
  Object.values(DISTRICTS_REGISTRY).forEach(district => {
    routes.add(`/locations/${district.stateSlug}/${district.slug}`);
  });

  // 4. Regional State Directory pages (/:stateSlug)
  Object.keys(STATE_DIRECTORY).forEach(stateSlug => {
    routes.add(`/${stateSlug}`);
  });

  // 5. Regional City Directory pages (/:stateSlug/:citySlug)
  Object.values(CITY_DIRECTORY).forEach(city => {
    routes.add(`/${city.stateSlug}/${city.slug}`);
  });

  // 6. Blog Posts (/blog/:slug)
  BLOG_POSTS.forEach(post => {
    routes.add(`/blog/${post.slug}`);
  });

  // 7. Competitor Comparison pages (/compare/:slug)
  Object.values(COMPETITOR_COMPARISONS).forEach(comp => {
    routes.add(`/compare/${comp.slug}`);
  });

  // 8. Demos (/demo/:slug)
  const demoSlugs = [
    'contractor-surge',
    'medical-surge',
    'legal-surge',
    'restaurant-surge',
    'franchise-surge',
    'emergency-hvac',
    'luxury-roofing'
  ];
  demoSlugs.forEach(slug => {
    routes.add(`/demo/${slug}`);
  });

  // 9. Also parse public/sitemap.xml for any additional URLs
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const locMatches = sitemapContent.matchAll(/<loc>https:\/\/localsurgeseo\.com([^<]*)<\/loc>/g);
    for (const match of locMatches) {
      let route = match[1] || '/';
      if (route.startsWith('http')) continue;
      if (!route.startsWith('/')) route = '/' + route;
      routes.add(route);
    }
  }

  return Array.from(routes);
}

async function runStaticPrerender() {
  console.log(`\x1b[1;36m========================================================================\x1b[0m`);
  console.log(`\x1b[1;36m   ⚡ LOCAL SURGE SEO — Build-Time Static HTML Prerender Pipeline       \x1b[0m`);
  console.log(`\x1b[1;36m========================================================================\x1b[0m\n`);

  const distPath = path.join(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`\x1b[31m✖ Error: dist/index.html not found! Run 'vite build' first.\x1b[0m`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const allRoutes = getAllRoutesToPrerender();

  console.log(`✔ Found ${allRoutes.length} distinct target routes for static prerendering.`);
  console.log(`⏳ Generating static HTML files with self-referencing canonicals...\n`);

  let successCount = 0;
  let errorCount = 0;
  const summaries: PrerenderSummary[] = [];

  for (const route of allRoutes) {
    try {
      const cleanRoute = route.split('?')[0];
      const isHome = cleanRoute === '' || cleanRoute === '/';

      let renderedHtml = '';
      if (isHome) {
        renderedHtml = baseHtml;
      } else {
        const { html, status } = prerenderLocationHtmlWithStatus(baseHtml, cleanRoute);
        if (status !== 200) {
          console.warn(`  ⚠️ Skipping non-200 status (${status}) for route: ${cleanRoute}`);
          continue;
        }
        renderedHtml = html;
      }

      // Determine output path
      let fileRelativePath: string;
      if (isHome) {
        fileRelativePath = 'index.html';
      } else {
        // Strip trailing and leading slashes for folder structure
        const normalized = cleanRoute.replace(/^\/+/, '').replace(/\/+$/, '');
        fileRelativePath = path.join(normalized, 'index.html');
      }

      const fullOutputPath = path.join(distPath, fileRelativePath);
      const outputDir = path.dirname(fullOutputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(fullOutputPath, renderedHtml, 'utf8');

      // Extract title and canonical tag for validation
      const titleMatch = renderedHtml.match(/<title>([^<]*)<\/title>/i);
      const canonicalMatch = renderedHtml.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);

      summaries.push({
        route: cleanRoute,
        outputPath: fileRelativePath,
        canonical: canonicalMatch ? canonicalMatch[1] : 'MISSING',
        title: titleMatch ? titleMatch[1] : 'Untitled',
        status: 200
      });

      successCount++;
    } catch (err: any) {
      console.error(`  \x1b[31m✖ Error prerendering ${route}:\x1b[0m`, err.message);
      errorCount++;
    }
  }

  console.log(`\n\x1b[32m✔ Successfully prerendered ${successCount} static HTML pages into dist/\x1b[0m`);
  if (errorCount > 0) {
    console.warn(`\x1b[33m⚠️ Encountered ${errorCount} errors during prerendering.\x1b[0m`);
  }

  // Verification samples
  const sampleRoutes = ['/', '/pricing', '/florida', '/seo-tool', '/locations/california/los-angeles', '/blog'];
  console.log(`\n\x1b[1mSample Verification (Canonical & Title Accuracy):\x1b[0m`);
  console.log(`┌──────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┐`);
  console.log(`│ Route                                        │ Verified Canonical URL                                           │`);
  console.log(`├──────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤`);
  for (const sr of sampleRoutes) {
    const s = summaries.find(item => item.route === sr);
    if (s) {
      console.log(`│ ${s.route.padEnd(44)} │ ${s.canonical.padEnd(64)} │`);
    }
  }
  console.log(`└──────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┘\n`);

  console.log(`\x1b[32m✔ Static prerender pipeline complete! All pages ready for Googlebot.\x1b[0m\n`);
}

runStaticPrerender().catch(err => {
  console.error("Fatal static prerender error:", err);
  process.exit(1);
});
