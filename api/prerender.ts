import { STATES_REGISTRY, DISTRICTS_REGISTRY, getStateBySlug, getDistrictBySlug, getAllMappedStates, getAllMappedDistricts } from "../src/data/locationsData";

export function prerenderLocationHtml(rawHtml: string, requestPath: string): string {
  const cleanPath = requestPath.split('?')[0].replace(/\/$/, '') || '/';

  // 1. National Locations Index: /locations
  if (cleanPath === '/locations') {
    const states = getAllMappedStates();
    const districts = getAllMappedDistricts();

    const title = "U.S. Local Search Markets & Consumer Behavior Directory - Local Surge SEO";
    const description = "Explore interactive maps, consumer web utilization studies, and local business SEO strategies across U.S. states and districts.";
    const canonical = "https://localsurgeseo.com/locations";
    const ogImage = "https://localsurgeseo.com/assets/og-directory.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Locations", "item": canonical }
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does Local Surge analyze local consumer search behavior?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We aggregate empirical data from the U.S. Census Bureau, Small Business Administration (SBA), and local Google Map Pack query volumes to measure how local consumers discover and select neighborhood service providers."
              }
            },
            {
              "@type": "Question",
              "name": "Why is district-level SEO critical for small business owners?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Over 84% of local service searches occur on mobile devices within a narrow geographic radius. Winning the Google Local 3-Pack requires localized citations, coordinate anchoring, and structured schema markup rather than generic nationwide campaigns."
              }
            }
          ]
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-locations-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> / <span>Locations</span>
        </nav>
        <h1>United States Local Search Markets & Consumer Behavior Studies</h1>
        <p>${description}</p>
        <section>
          <h2>Published District SEO Studies</h2>
          <ul>
            ${districts.map(d => `<li><a href="/locations/${d.stateSlug}/${d.slug}">${d.name}, ${d.stateCode} Local SEO & Consumer Search Study</a> (${d.webUtilizationRate} Web Utilization)</li>`).join('\n')}
          </ul>
        </section>
        <section>
          <h2>Statewide SEO Strategy Blueprints</h2>
          <ul>
            ${states.map(s => `<li><a href="/locations/${s.slug}/">${s.name} Local Search Strategy Guide</a> (${s.totalBusinesses} Enterprises)</li>`).join('\n')}
          </ul>
        </section>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  // 2. State or District Path: /locations/:state or /locations/:state/:district
  if (cleanPath.startsWith('/locations/')) {
    const parts = cleanPath.slice('/locations/'.length).split('/').filter(Boolean);

    // State Page: /locations/:state
    if (parts.length === 1) {
      const stateSlug = parts[0].toLowerCase();
      const stateData = getStateBySlug(stateSlug);

      if (stateData) {
        const title = `${stateData.name} Local Search Behavior & Small Business SEO Guide - Local Surge`;
        const description = stateData.heroSubheadline;
        const canonical = `https://localsurgeseo.com/locations/${stateData.slug}/`;
        const ogImage = "https://localsurgeseo.com/assets/og-directory.png";

        const schemaJson = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://localsurgeseo.com/locations" },
                { "@type": "ListItem", "position": 3, "name": `${stateData.name}`, "item": canonical }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": stateData.faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
              }))
            }
          ]
        };

        const stateDistricts = stateData.districts.map(slug => DISTRICTS_REGISTRY[slug]).filter(Boolean);

        const crawlMarkup = `
          <div id="ssr-locations-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
            <nav aria-label="Breadcrumb">
              <a href="/">Home</a> / <a href="/locations">Locations</a> / <span>${stateData.name}</span>
            </nav>
            <h1>${stateData.heroHeadline}</h1>
            <p>${stateData.heroSubheadline}</p>
            <section>
              <h2>Statewide Consumer Search Trends</h2>
              <p>${stateData.consumerBehavior.overview}</p>
              <ul>
                ${stateData.consumerBehavior.keyFindings.map(kf => `<li>${kf}</li>`).join('\n')}
              </ul>
            </section>
            <section>
              <h2>Local Business Owner Strategy Blueprint</h2>
              <p>${stateData.businessStrategy.overview}</p>
              <ol>
                ${stateData.businessStrategy.actionSteps.map(step => `<li><strong>${step.title}</strong>: ${step.detail}</li>`).join('\n')}
              </ol>
            </section>
            <section>
              <h2>Verified Research Data Citations & External Backlinks</h2>
              <ul>
                ${stateData.citations.map(c => `<li><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.anchorText}</a> - ${c.sourceName}: ${c.finding}</li>`).join('\n')}
              </ul>
            </section>
            <section>
              <h2>Mapped Districts in ${stateData.name}</h2>
              <ul>
                ${stateDistricts.map(d => `<li><a href="/locations/${d.stateSlug}/${d.slug}">${d.name} Local SEO Study</a></li>`).join('\n')}
              </ul>
            </section>
          </div>
        `;

        return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
      }
    }

    // District Page: /locations/:state/:district
    if (parts.length >= 2) {
      const stateSlug = parts[0].toLowerCase();
      const districtSlug = parts[1].toLowerCase();
      const districtData = getDistrictBySlug(districtSlug);

      if (districtData) {
        const title = `${districtData.name}, ${districtData.stateCode} Local SEO Strategy & Consumer Search Study - Local Surge`;
        const description = districtData.heroSubheadline;
        const canonical = `https://localsurgeseo.com/locations/${districtData.stateSlug}/${districtData.slug}`;
        const ogImage = "https://localsurgeseo.com/assets/og-directory.png";

        const schemaJson = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://localsurgeseo.com/locations" },
                { "@type": "ListItem", "position": 3, "name": `${districtData.stateName}`, "item": `https://localsurgeseo.com/locations/${districtData.stateSlug}/` },
                { "@type": "ListItem", "position": 4, "name": `${districtData.name} Local SEO`, "item": canonical }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": districtData.faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
              }))
            },
            {
              "@type": "LocalBusiness",
              "name": `Local Surge SEO - ${districtData.name}`,
              "description": districtData.heroSubheadline,
              "url": canonical,
              "telephone": "+1-909-707-5075",
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": districtData.lat,
                "longitude": districtData.lng
              }
            }
          ]
        };

        const crawlMarkup = `
          <div id="ssr-locations-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
            <nav aria-label="Breadcrumb">
              <a href="/">Home</a> / <a href="/locations">Locations</a> / <a href="/locations/${districtData.stateSlug}/">${districtData.stateName}</a> / <span>${districtData.name} District SEO</span>
            </nav>
            <h1>${districtData.heroHeadline}</h1>
            <p>${districtData.heroSubheadline}</p>
            <section>
              <h2>Key Consumer Metrics: ${districtData.name}</h2>
              <ul>
                <li>Local Consumer Web Utilization Rate: ${districtData.webUtilizationRate}</li>
                <li>Mobile Search Query Share: ${districtData.mobileSearchShare}</li>
                <li>Google Local 3-Pack Click Share: ${districtData.mapPackClickShare}</li>
                <li>Active Small Businesses: ${districtData.smallBusinesses}</li>
              </ul>
            </section>
            <section>
              <h2>Empirical Study: Local Customer Behavior in ${districtData.name}</h2>
              <p>${districtData.consumerBehavior.overview}</p>
              <ul>
                ${districtData.consumerBehavior.keyFindings.map(kf => `<li>${kf}</li>`).join('\n')}
              </ul>
            </section>
            <section>
              <h2>Local Business Owner SEO Strategy & Action Blueprint</h2>
              <p>${districtData.businessStrategy.overview}</p>
              <ol>
                ${districtData.businessStrategy.actionSteps.map(step => `<li><strong>${step.title} (${step.step})</strong>: ${step.detail}</li>`).join('\n')}
              </ol>
            </section>
            <section>
              <h2>Municipal Cities & Communities in ${districtData.name} District</h2>
              <p>The following municipal cities, suburban hubs, and commercial zones fall directly within the ${districtData.name} local service perimeter: ${districtData.municipalCities.join(', ')}.</p>
            </section>
            <section>
              <h2>Authoritative Research Citations & Source Backlinks</h2>
              <ul>
                ${districtData.citations.map(c => `<li><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.anchorText}</a> - ${c.sourceName}: ${c.finding} (${c.title})</li>`).join('\n')}
              </ul>
            </section>
            <section>
              <h2>Frequently Asked Questions: ${districtData.name} SEO</h2>
              ${districtData.faqs.map(f => `<h3>${f.question}</h3><p>${f.answer}</p>`).join('\n')}
            </section>
          </div>
        `;

        return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
      }
    }
  }

  return rawHtml;
}

function injectMetadataAndFallback(
  html: string,
  title: string,
  description: string,
  canonical: string,
  ogImage: string,
  schemaJson: object,
  crawlMarkup: string
): string {
  let result = html;

  // Replace Title
  result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // Replace Meta Description
  result = result.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="description" content="${description}" />`);

  // Replace or Add Canonical
  if (result.includes('<link rel="canonical"')) {
    result = result.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  } else {
    result = result.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n  </head>`);
  }

  // Replace OpenGraph Title & Description & Image
  result = result.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  result = result.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  result = result.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  result = result.replace(/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />\n  <meta property="og:image:alt" content="${title}" />`);

  // Inject JSON-LD Schema
  const schemaString = `\n  <script type="application/ld+json">\n  ${JSON.stringify(schemaJson, null, 2)}\n  </script>\n`;
  result = result.replace('</head>', `${schemaString}</head>`);

  // Inject Crawlable Pre-Rendered HTML inside #root
  result = result.replace('<div id="root">', `<div id="root">\n${crawlMarkup}`);

  return result;
}
