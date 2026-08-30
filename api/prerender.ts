import { STATES_REGISTRY, DISTRICTS_REGISTRY, getStateBySlug, getDistrictBySlug, getAllMappedStates, getAllMappedDistricts } from "../src/data/locationsData";
import { BLOG_POSTS, getClusterForPost } from "../src/data/blogData";
import { STATE_DIRECTORY, CITY_DIRECTORY } from "../src/data/directoryData";

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

  // 3. Blog Article SSR: /blog/:slug
  if (cleanPath.startsWith('/blog/')) {
    const slug = cleanPath.slice('/blog/'.length).trim().toLowerCase();
    const post = BLOG_POSTS.find(p => p.slug.toLowerCase() === slug);
    if (post) {
      const title = `${post.title} - Local Surge SEO`;
      const description = post.description;
      const canonical = `https://localsurgeseo.com/blog/${post.slug}`;
      const ogImage = post.image.startsWith('http') ? post.image : `https://localsurgeseo.com${post.image}`;

      const schemaJson = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://localsurgeseo.com/blog" },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": canonical }
            ]
          },
          {
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.description,
            "image": ogImage,
            "datePublished": "2026-08-01",
            "dateModified": "2026-08-30",
            "author": {
              "@type": "Person",
              "name": post.author.name,
              "jobTitle": post.author.role
            },
            "publisher": {
              "@type": "Organization",
              "name": "Local Surge SEO",
              "logo": {
                "@type": "ImageObject",
                "url": "https://localsurgeseo.com/favicon.svg"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonical
            }
          }
        ]
      };

      const sectionsHtml = post.sections.map(sec => {
        if (sec.type === 'heading') {
          return `<h2>${sec.content}</h2>`;
        }
        if (sec.type === 'paragraph') {
          return `<p>${sec.content}</p>`;
        }
        if (sec.type === 'bullet-list' && sec.items) {
          return `<ul>${sec.items.map(it => `<li>${it}</li>`).join('\n')}</ul>`;
        }
        if (sec.type === 'numbered-list' && sec.items) {
          return `<ol>${sec.items.map(it => `<li>${it}</li>`).join('\n')}</ol>`;
        }
        if (sec.type === 'quote') {
          return `<blockquote>${sec.content}</blockquote>`;
        }
        if (sec.type === 'alert-box') {
          return `<div role="note"><p>${sec.content}</p></div>`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const crawlMarkup = `
        <div id="ssr-blog-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
          <nav aria-label="Breadcrumb">
            <a href="/">Home</a> / <a href="/blog">Blog</a> / <span>${post.title}</span>
          </nav>
          <article>
            <header>
              <span>${post.category}</span>
              <h1>${post.title}</h1>
              <p>By ${post.author.name} (${post.author.role}) • Published ${post.date} • ${post.readTime}</p>
              <p>${post.description}</p>
            </header>
            <main>
              ${sectionsHtml}
            </main>
            <footer>
              ${(() => {
                const clusterInfo = getClusterForPost(post.slug);
                if (!clusterInfo) return '';
                const { cluster, role } = clusterInfo;
                const isPillar = role === 'pillar';
                const pillarPost = BLOG_POSTS.find(p => p.slug === cluster.pillarSlug);
                const spokePosts = cluster.spokeSlugs.map(slug => BLOG_POSTS.find(p => p.slug === slug)).filter(Boolean);
                const crossPost = BLOG_POSTS.find(p => p.slug === cluster.crossLinkSlug);

                return `
                  <aside aria-label="Topic Cluster Series">
                    <h3>Topic Cluster: ${cluster.name} (${isPillar ? 'Master Pillar Guide' : 'Companion Spoke Guide'})</h3>
                    <p>${cluster.description}</p>
                    ${!isPillar && pillarPost ? `<p><strong>Core Pillar Blueprint:</strong> <a href="/blog/${pillarPost.slug}">${pillarPost.title}</a></p>` : ''}
                    <h4>${isPillar ? 'Spoke Guides in this Topic Cluster:' : 'Sibling Guides in this Series:'}</h4>
                    <ul>
                      ${(isPillar ? spokePosts : spokePosts.filter(p => p!.slug !== post.slug)).map(p => `<li><a href="/blog/${p!.slug}">${p!.title}</a> (${p!.category})</li>`).join('\n')}
                    </ul>
                    ${crossPost ? `<p><strong>Recommended Cross-Cluster Reading:</strong> <a href="/blog/${crossPost.slug}">${crossPost.title}</a></p>` : ''}
                  </aside>
                `;
              })()}
              <section>
                <h3>Primary Verification Sources</h3>
                <ul>
                  <li><a href="https://developers.google.com/search/docs" target="_blank" rel="noopener">Google Search Central Documentation</a></li>
                  <li><a href="https://schema.org" target="_blank" rel="noopener">Schema.org Structured Data Vocabularies</a></li>
                  <li><a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noopener">W3C Web Standards</a></li>
                </ul>
              </section>
            </footer>
          </article>
        </div>
      `;

      return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
    }
  }

  // 4. Core Pages SSR: /pricing, /about, /why-us, /case-studies, /local-seo
  if (cleanPath === '/pricing') {
    const title = "Transparent Local SEO Pricing & Plans - Local Surge SEO";
    const description = "Contract-free monthly SEO signal boosters: Single-Page Blast ($0/mo), Starter Boost ($999/mo), and Premium Surge ($1,999/mo). Complete pricing matrix.";
    const canonical = "https://localsurgeseo.com/pricing";
    const ogImage = "https://localsurgeseo.com/assets/og-image.jpg";

    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      "name": "Local Surge SEO Pricing Plans",
      "itemListElement": [
        { "@type": "Offer", "name": "Single-Page Blast", "price": "0", "priceCurrency": "USD", "description": "Professional mobile-first single page optimized instantly for local keywords." },
        { "@type": "Offer", "name": "Starter Boost", "price": "999", "priceCurrency": "USD", "description": "GBP syncing, localized keyword mapping (10 terms), and 20 top directory citations." },
        { "@type": "Offer", "name": "Premium Surge", "price": "1999", "priceCurrency": "USD", "description": "Full competitor domination, 4 monthly localized articles, and high-authority backlinks." }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-pricing-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <h1>Transparent Local SEO Pricing & Service Plans</h1>
        <p>${description}</p>
        <section>
          <h2>Single-Page Blast - $0 / Month (Free Tier)</h2>
          <p>Ideal for solopreneurs, local tradesmen, and early-stage service providers needing an immediate search presence.</p>
        </section>
        <section>
          <h2>Starter Boost - $999 / Month</h2>
          <p>For brick-and-mortar businesses seeking Google Local 3-Pack rankings, GBP synchronization, 10 local target keywords, and 20 directory citation builds.</p>
        </section>
        <section>
          <h2>Premium Surge - $1,999 / Month</h2>
          <p>For high-competition contractors, cosmetic practices, and law firms. Includes unlimited pages, 4 localized articles monthly, high-authority backlink development, and bi-weekly strategy calls.</p>
        </section>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  if (cleanPath === '/case-studies') {
    const title = "Local SEO Case Studies & Map Pack Revenue Surges - Local Surge";
    const description = "Proven results: see how contractors, dental clinics, and regional law firms doubled inbound phone calls and dominated Google Map Pack rankings.";
    const canonical = "https://localsurgeseo.com/case-studies";
    const ogImage = "https://localsurgeseo.com/assets/og-image.jpg";

    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
        { "@type": "ListItem", "position": 2, "name": "Case Studies", "item": canonical }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-casestudies-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <h1>Local SEO Case Studies & Search Revenue Surges</h1>
        <p>${description}</p>
        <article>
          <h2>Apex Roofing & Restoration (Dallas, TX)</h2>
          <p>Result: +312% organic Map Pack impressions, 44 new commercial roofing inbound leads per month within 90 days of GBP category restructuring and coordinate pinning.</p>
        </article>
        <article>
          <h2>Harbor View Dental Care (Miami, FL)</h2>
          <p>Result: Rank #1 in Local 3-Pack for 'emergency dentist near me', +185% patient appointment requests following schema deployment.</p>
        </article>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  // 5. Regional City Directory: /:stateSlug/:citySlug
  const pathParts = cleanPath.split('/').filter(Boolean);
  if (pathParts.length === 2) {
    const [stateSlugCandidate, citySlugCandidate] = pathParts;
    const cityData = CITY_DIRECTORY[citySlugCandidate];
    if (cityData && cityData.stateSlug === stateSlugCandidate) {
      const title = `${cityData.name} Rankings & Local Maps Blueprint - Local Surge`;
      const description = cityData.intro;
      const canonical = `https://localsurgeseo.com/${cityData.stateSlug}/${cityData.slug}`;
      const ogImage = "https://localsurgeseo.com/assets/og-directory.png";

      const schemaJson = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
              { "@type": "ListItem", "position": 2, "name": "Sitemap", "item": "https://localsurgeseo.com/site-map" },
              { "@type": "ListItem", "position": 3, "name": cityData.stateName, "item": `https://localsurgeseo.com/${cityData.stateSlug}` },
              { "@type": "ListItem", "position": 4, "name": cityData.name, "item": canonical }
            ]
          },
          {
            "@type": "LocalBusiness",
            "name": `Local Surge SEO - ${cityData.name}`,
            "description": cityData.intro,
            "url": canonical,
            "telephone": "+1-909-707-5075",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": cityData.stateCode,
              "addressCountry": "US"
            }
          }
        ]
      };

      const crawlMarkup = `
        <div id="ssr-city-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
          <nav aria-label="Breadcrumb">
            <a href="/">Home</a> / <a href="/site-map">Sitemap</a> / <a href="/${cityData.stateSlug}">${cityData.stateName}</a> / <span>${cityData.name}</span>
          </nav>
          <h1>${cityData.name} Local SEO & Maps Rankings</h1>
          <p>${cityData.intro}</p>
          <section>
            <h2>${cityData.name} Economic Projections & Demographics</h2>
            <ul>
              <li>Population: ${cityData.population}</li>
              <li>Small Businesses: ${cityData.businessCount}</li>
              <li>Annual Business Revenue: ${cityData.revenue}</li>
              <li>Digital Opportunity Score: ${cityData.digitalOpportunity}</li>
            </ul>
          </section>
          <section>
            <h2>Key Statistics for ${cityData.name} Local Businesses</h2>
            <ul>
              ${cityData.keyStatsList.map(s => `<li>${s}</li>`).join('\n')}
            </ul>
          </section>
          <section>
            <h2>Local Neighborhood Authority Nodes in ${cityData.name}</h2>
            <ul>
              ${cityData.neighborhoods.map(n => `<li><strong>${n.name} (${n.tag})</strong>: Focused on ${n.focus} (Schema: ${n.schema})</li>`).join('\n')}
            </ul>
          </section>
          <section>
            <h2>Market Realities for ${cityData.name} Owners</h2>
            <ul>
              ${cityData.realityPoints.map(r => `<li><strong>${r.title}</strong>: ${r.desc}</li>`).join('\n')}
            </ul>
          </section>
          <section>
            <h2>Strategic Advantages with Local Surge SEO</h2>
            <ul>
              ${cityData.advantagePoints.map(a => `<li><strong>${a.title}</strong>: ${a.desc}</li>`).join('\n')}
            </ul>
          </section>
        </div>
      `;

      return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
    }
  }

  // 6. Regional State Directory: /:stateSlug
  if (pathParts.length === 1) {
    const stateSlugCandidate = pathParts[0];
    const stateData = STATE_DIRECTORY[stateSlugCandidate];
    if (stateData) {
      const title = `${stateData.name} Local SEO Directory - Local Surge SEO`;
      const description = stateData.intro;
      const canonical = `https://localsurgeseo.com/${stateData.slug}`;
      const ogImage = "https://localsurgeseo.com/assets/og-directory.png";

      const schemaJson = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
              { "@type": "ListItem", "position": 2, "name": "Sitemap", "item": "https://localsurgeseo.com/site-map" },
              { "@type": "ListItem", "position": 3, "name": stateData.name, "item": canonical }
            ]
          }
        ]
      };

      const crawlMarkup = `
        <div id="ssr-state-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
          <nav aria-label="Breadcrumb">
            <a href="/">Home</a> / <a href="/site-map">Sitemap</a> / <span>${stateData.name}</span>
          </nav>
          <h1>${stateData.name} Local SEO Directory</h1>
          <p>${stateData.intro}</p>
          <section>
            <h2>${stateData.name} Enterprise Statistics</h2>
            <ul>
              ${stateData.keyStatsList.map(s => `<li>${s}</li>`).join('\n')}
            </ul>
          </section>
          <section>
            <h2>Regional Hubs in ${stateData.name}</h2>
            <ul>
              ${stateData.hubs.map(h => `<li><strong>${h.name} (${h.tag})</strong>: Focused on ${h.focus}</li>`).join('\n')}
            </ul>
          </section>
        </div>
      `;

      return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
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
