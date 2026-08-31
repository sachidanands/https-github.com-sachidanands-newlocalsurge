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

  // 1b. HTML Sitemap: /site-map (and aliases /sitemap, /sitemap.html, /site-map.html)
  if (['/site-map', '/sitemap', '/sitemap.html', '/site-map.html'].includes(cleanPath)) {
    const title = "Directory Sitemap & Complete Page Architecture - Local Surge SEO";
    const description = "Comprehensive index of all 91 live pages, location guides, city directories, tools, and blog posts published on Local Surge SEO.";
    const canonical = "https://localsurgeseo.com/site-map";
    const ogImage = "https://localsurgeseo.com/assets/og-directory.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Sitemap", "item": canonical }
          ]
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-sitemap-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> / <span>Sitemap</span>
        </nav>
        <h1>Local Surge SEO - Complete Website Architecture & Sitemap</h1>
        <p>${description}</p>
        <section>
          <h2>Core Pages</h2>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/why-us">Why Choose Us</a></li>
            <li><a href="/local-seo">Local SEO Services</a></li>
            <li><a href="/pricing">Pricing & Packages</a></li>
            <li><a href="/seo-tool">Free Local SEO Audit Tool</a></li>
            <li><a href="/contact">Contact & Strategy Consultation</a></li>
            <li><a href="/case-studies">Real Client Case Studies</a></li>
            <li><a href="/locations">United States Locations Index</a></li>
            <li><a href="/blog">Local SEO Editorial & Growth Blog</a></li>
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
              "priceRange": "$$",
              "currenciesAccepted": "USD",
              "paymentAccepted": "Credit Card, Debit Card, Invoice",
              "openingHours": "Mo-Fr 08:00-18:00",
              "areaServed": {
                "@type": "AdministrativeArea",
                "name": districtData.name
              },
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

  // 3a. Blog Index SSR: /blog
  if (cleanPath === '/blog') {
    const title = "Local Marketing Insights Blog - Local Surge SEO";
    const description = "Read expert guides and actionable strategies on local search, generative engine optimization (GEO), and ranking in the AI search era.";
    const canonical = "https://localsurgeseo.com/blog";
    const ogImage = "https://localsurgeseo.com/assets/og-blog.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": canonical }
          ]
        },
        {
          "@type": "Blog",
          "name": title,
          "description": description,
          "url": canonical
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-blog-index-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> / <span>Blog</span>
        </nav>
        <h1>Local Marketing Insights & Search Domination Guides</h1>
        <p>${description}</p>
        <section>
          <h2>All Strategy Guides (${BLOG_POSTS.length})</h2>
          <ul>
            ${BLOG_POSTS.map(p => `<li><a href="/blog/${p.slug}">${p.title}</a> (${p.category})</li>`).join('\n')}
          </ul>
        </section>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  // 3b. Blog Article SSR: /blog/:slug
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
            "datePublished": (() => {
              try {
                const d = new Date(post.date);
                return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : "2026-08-01";
              } catch (e) {
                return "2026-08-01";
              }
            })(),
            "dateModified": "2026-08-30",
            "inLanguage": "en-US",
            "articleSection": post.category,
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
    const ogImage = "https://localsurgeseo.com/assets/og-pricing.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Pricing", "item": canonical }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Local Surge SEO Pricing Plans",
          "itemListElement": [
            { "@type": "Offer", "name": "Single-Page Blast", "price": "0", "priceCurrency": "USD", "description": "Professional mobile-first single page optimized instantly for local keywords." },
            { "@type": "Offer", "name": "Starter Boost", "price": "999", "priceCurrency": "USD", "description": "GBP syncing, localized keyword mapping (10 terms), and 20 top directory citations." },
            { "@type": "Offer", "name": "Premium Surge", "price": "1999", "priceCurrency": "USD", "description": "Full competitor domination, 4 monthly localized articles, and high-authority backlinks." }
          ]
        }
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
    const ogImage = "https://localsurgeseo.com/assets/og-directory.png";

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

  if (cleanPath === '/local-seo') {
    const title = "Local SEO Services & Google Maps Domination - Local Surge SEO";
    const description = "Data-driven local SEO and Google Local 3-Pack optimization. Geo-coordinate grid expansion, review velocity, and NAP directory citation authority.";
    const canonical = "https://localsurgeseo.com/local-seo";
    const ogImage = "https://localsurgeseo.com/assets/og-local-seo.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Local SEO Services", "item": canonical }
          ]
        },
        {
          "@type": "Service",
          "name": "Local SEO & Google Maps Optimization",
          "serviceType": "Search Engine Optimization",
          "provider": {
            "@type": "Organization",
            "name": "Local Surge SEO",
            "url": "https://localsurgeseo.com/"
          },
          "areaServed": {
            "@type": "Country",
            "name": "United States"
          },
          "description": description,
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Local SEO Plans",
            "itemListElement": [
              { "@type": "Offer", "name": "Single-Page Blast", "price": "0", "priceCurrency": "USD" },
              { "@type": "Offer", "name": "Starter Boost", "price": "999", "priceCurrency": "USD" },
              { "@type": "Offer", "name": "Premium Surge", "price": "1999", "priceCurrency": "USD" }
            ]
          }
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-localseo-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <h1>Local SEO Services & Google Maps Domination</h1>
        <p>${description}</p>
        <section>
          <h2>The Proximity Problem: Why Good Businesses Disappear</h2>
          <p>Local businesses often lose high-intent customers simply because they lack geo-coordinate relevance and consistent NAP citations across directory ecosystems.</p>
        </section>
        <section>
          <h2>The 4 Pillars of Local Search Dominance</h2>
          <ul>
            <li>Google Business Profile (GBP) Precision Categorization</li>
            <li>Hyperlocal Schema & Coordinate Pinning</li>
            <li>Review Velocity & Customer Sentiment Signals</li>
            <li>High-Authority Local Directory Syndication</li>
          </ul>
        </section>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  if (cleanPath === '/seo-tool') {
    const title = "Free Local SEO Diagnostic Scanner & Audit Tool - Local Surge";
    const description = "Scan your local business Google Maps readiness, NAP directory consistency, schema markup, and Core Web Vitals instantly.";
    const canonical = "https://localsurgeseo.com/seo-tool";
    const ogImage = "https://localsurgeseo.com/assets/og-seo-tool.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Free SEO Scanner", "item": canonical }
          ]
        },
        {
          "@type": "WebApplication",
          "name": "Local Surge SEO Diagnostic Scanner",
          "url": canonical,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires modern web browser with JavaScript enabled",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": description
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-seotool-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <h1>Free Local SEO Diagnostic Scanner & Audit Suite</h1>
        <p>${description}</p>
        <section>
          <h2>Instant Search Readiness Diagnostic</h2>
          <p>Analyze your domain for Google Map Pack compatibility, title and meta tags, Open Graph declarations, structured data schemas, and Core Web Vitals.</p>
        </section>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  if (cleanPath === '/about' || cleanPath === '/why-us') {
    const isWhyUs = cleanPath === '/why-us';
    const title = isWhyUs
      ? "Why Choose Local Surge SEO - Transparent Signal Engineering"
      : "About Local Surge SEO - Mission & Search Intelligence Architecture";
    const description = isWhyUs
      ? "Why smart local businesses choose Local Surge: empirical search studies, zero lock-in contracts, and verified map pack rankings."
      : "Learn about the mission, engineering team, and empirical search methodology behind Local Surge SEO's local search domination platform.";
    const canonical = `https://localsurgeseo.com${cleanPath}`;
    const ogImage = isWhyUs
      ? "https://localsurgeseo.com/assets/og-why-us.png"
      : "https://localsurgeseo.com/assets/og-about.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": isWhyUs ? "Why Us" : "About", "item": canonical }
          ]
        },
        {
          "@type": "AboutPage",
          "name": title,
          "url": canonical,
          "description": description,
          "mainEntity": {
            "@type": "Organization",
            "name": "Local Surge SEO",
            "url": "https://localsurgeseo.com/"
          }
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-about-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  if (cleanPath === '/contact') {
    const title = "Contact Local Surge SEO - Talk to a Local Search Strategist";
    const description = "Connect with our local search strategists for custom Google Maps rankings blueprints, citation audits, and technical SEO consultation.";
    const canonical = "https://localsurgeseo.com/contact";
    const ogImage = "https://localsurgeseo.com/assets/og-contact.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Contact", "item": canonical }
          ]
        },
        {
          "@type": "ContactPage",
          "name": "Contact Local Surge SEO",
          "url": canonical,
          "description": description,
          "mainEntity": {
            "@type": "ProfessionalService",
            "name": "Local Surge SEO",
            "telephone": "+1-909-707-5075",
            "email": "contact@localsurgeseo.com",
            "url": "https://localsurgeseo.com/"
          }
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-contact-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <h1>Contact Local Surge SEO</h1>
        <p>${description}</p>
        <p>Telephone: +1-909-707-5075</p>
        <p>Email: contact@localsurgeseo.com</p>
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
            "priceRange": "$$",
            "currenciesAccepted": "USD",
            "paymentAccepted": "Credit Card, Debit Card, Invoice",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": cityData.name,
              "addressRegion": cityData.stateCode,
              "addressCountry": "US"
            },
            "areaServed": {
              "@type": "City",
              "name": cityData.name
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
              ${cityData.realityPoints.map(r => `<li>${r}</li>`).join('\n')}
            </ul>
          </section>
          <section>
            <h2>Strategic Advantages with Local Surge SEO</h2>
            <ul>
              ${cityData.advantagePoints.map(a => `<li>${a}</li>`).join('\n')}
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

  // 7. Interactive Showcase Demos: /demo/:demoSlug
  if (cleanPath.startsWith('/demo/')) {
    const demoSlug = cleanPath.slice('/demo/'.length).trim().toLowerCase();
    
    const DEMO_PREVIEWS: Record<string, {
      businessName: string;
      niche: string;
      location: string;
      heroHeadline: string;
      heroSubheadline: string;
      services: { title: string; desc: string }[];
    }> = {
      'contractor-surge': {
        businessName: 'Apex Pro Trade & Contractor Services',
        niche: 'HVAC, Plumbing & Roofing Contractors',
        location: 'Dallas-Fort Worth, TX',
        heroHeadline: 'Fast, Trusted Local Contractor Services & Emergency Repairs',
        heroSubheadline: 'Interactive showcase of a high-performance local contractor single-page website. Optimized for Google 3-Pack rankings, emergency calls, and zero-click AI citations.',
        services: [
          { title: '24/7 Emergency Repairs', desc: 'Rapid response dispatch for urgent home and commercial heating, plumbing, and roofing needs.' },
          { title: 'Complete Diagnostic Inspection', desc: 'Precision diagnostics utilizing thermal scanners and modern inspection equipment.' },
          { title: 'System Replacement & Installation', desc: 'High-efficiency installations backed by 10-year comprehensive warranties.' },
          { title: 'Preventative Maintenance Plans', desc: 'Scheduled seasonal tune-ups to avoid costly unexpected breakdowns.' }
        ]
      },
      'dental-surge': {
        businessName: 'Harbor View Family & Cosmetic Dentistry',
        niche: 'Dental & Orthodontic Practice',
        location: 'Miami, FL',
        heroHeadline: 'Modern, Gentle Dental Care & Emergency Practice',
        heroSubheadline: 'Interactive local SEO demo for dental clinics and medical practices. Engineered for high-intent patient acquisition, local schema, and Google Maps prominence.',
        services: [
          { title: 'Same-Day Emergency Care', desc: 'Immediate relief for toothaches, chipped teeth, and urgent dental needs.' },
          { title: 'Preventative & Family Hygiene', desc: 'Comprehensive exams, digital low-radiation X-rays, and ultrasonic cleanings.' },
          { title: 'Cosmetic Veneers & Whitening', desc: 'Custom porcelain veneers and professional in-office smile transformations.' },
          { title: 'Dental Implants & Restorations', desc: 'State-of-the-art restorative implants with permanent lifetime durability.' }
        ]
      },
      'legal-surge': {
        businessName: 'Vanguard Regional Legal Group & Attorneys',
        niche: 'Personal Injury, Business & Family Law',
        location: 'San Jose, CA',
        heroHeadline: 'Aggressive Local Legal Representation with Proven Results',
        heroSubheadline: 'Interactive local SEO demo for regional law firms and legal practices. Designed for ultra-high conversion rates, client intake, and local search dominance.',
        services: [
          { title: 'Personal Injury Litigation', desc: 'No fee unless we win. Maximum financial compensation for auto accidents and injuries.' },
          { title: 'Business Formation & Contracts', desc: 'Corporate structuring, contract negotiations, and trademark dispute protection.' },
          { title: 'Estate Planning & Trusts', desc: 'Comprehensive asset protection, revocable living trusts, and probate administration.' },
          { title: 'Family Law & Mediation', desc: 'Compassionate guidance through child custody, divorce, and settlement mediation.' }
        ]
      }
    };

    const demoInfo = DEMO_PREVIEWS[demoSlug] || {
      businessName: demoSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Services',
      niche: 'Local Trade Services',
      location: 'San Jose, CA',
      heroHeadline: `Fast, Trusted Local Services in ${demoSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
      heroSubheadline: 'High-performance single-page local website blueprint built by Local Surge SEO.',
      services: [
        { title: 'Emergency Dispatch', desc: '24/7 rapid response for urgent local service calls.' },
        { title: 'Full Inspection', desc: 'Complete diagnostic review with upfront transparent pricing.' }
      ]
    };

    const title = `${demoInfo.businessName} - Local SEO & Single-Page Blueprint Demo`;
    const description = demoInfo.heroSubheadline;
    const canonical = `https://localsurgeseo.com/demo/${demoSlug}`;
    const ogImage = "https://localsurgeseo.com/assets/og-home.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": "Demos", "item": "https://localsurgeseo.com/pricing" },
            { "@type": "ListItem", "position": 3, "name": demoInfo.businessName, "item": canonical }
          ]
        },
        {
          "@type": "LocalBusiness",
          "name": demoInfo.businessName,
          "description": demoInfo.heroSubheadline,
          "url": canonical,
          "telephone": "+1-909-707-5075",
          "priceRange": "$$",
          "currenciesAccepted": "USD",
          "paymentAccepted": "Credit Card, Debit Card, Invoice",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": demoInfo.location.split(',')[0].trim(),
            "addressRegion": demoInfo.location.split(',')[1]?.trim() || "CA",
            "addressCountry": "US"
          },
          "areaServed": {
            "@type": "AdministrativeArea",
            "name": demoInfo.location
          }
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-demo-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> / <a href="/pricing">Pricing</a> / <span>${demoInfo.businessName}</span>
        </nav>
        <h1>${demoInfo.heroHeadline}</h1>
        <p>${demoInfo.heroSubheadline}</p>
        <section>
          <h2>Core Services</h2>
          <ul>
            ${demoInfo.services.map(s => `<li><strong>${s.title}</strong>: ${s.desc}</li>`).join('\n')}
          </ul>
        </section>
        <section>
          <h2>About This Single-Page Demo</h2>
          <p>This high-converting landing page is engineered by Local Surge SEO to demonstrate how local service providers capture Google Local 3-Pack prominence with mobile-first architecture and schema markup.</p>
          <p><a href="/pricing">Claim Your Free Single-Page Website</a> or call +1 (909) 707-5075.</p>
        </section>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  // 8. Legal Pages: /privacy-policy & /terms-of-service
  if (cleanPath === '/privacy-policy' || cleanPath === '/terms-of-service') {
    const isPrivacy = cleanPath === '/privacy-policy';
    const title = isPrivacy
      ? "Privacy Policy - Local Surge SEO Data Protection & Privacy Notice"
      : "Terms of Service & Client Engagement Agreement - Local Surge SEO";
    const description = isPrivacy
      ? "Our statutory privacy policy detailing data collection, CCPA/CPRA, PIPEDA alignment, analytics tracking, and consumer privacy rights."
      : "Governing terms of service, billing guidelines, cancel-anytime policy, and professional client engagement standards for Local Surge SEO.";
    const canonical = `https://localsurgeseo.com${cleanPath}`;
    const ogImage = "https://localsurgeseo.com/assets/og-home.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
            { "@type": "ListItem", "position": 2, "name": isPrivacy ? "Privacy Policy" : "Terms of Service", "item": canonical }
          ]
        },
        {
          "@type": "WebPage",
          "name": title,
          "url": canonical,
          "description": description,
          "publisher": {
            "@type": "Organization",
            "name": "Local Surge SEO",
            "url": "https://localsurgeseo.com/"
          }
        }
      ]
    };

    const crawlMarkup = `
      <div id="ssr-legal-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> / <span>${isPrivacy ? "Privacy Policy" : "Terms of Service"}</span>
        </nav>
        <h1>${title}</h1>
        <p>${description}</p>
        <section>
          <h2>Company Information</h2>
          <p>Local Surge SEO operates as a Service Area Business (SAB) headquartered virtually in San Jose, CA 95112. Contact: contact@localsurgeseo.com | Telephone: +1-909-707-5075.</p>
        </section>
      </div>
    `;

    return injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  }

  // 12. Fallback 404 SSR Page for Unmatched URLs
  const title = "404 - Page Not Found | Local Surge SEO";
  const description = "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Browse our popular local SEO tools, pricing packages, and location guides.";
  const canonical = `https://localsurgeseo.com${cleanPath}`;
  const ogImage = "https://localsurgeseo.com/assets/og-home.png";

  const schemaJson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
          { "@type": "ListItem", "position": 2, "name": "404 Not Found", "item": canonical }
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://localsurgeseo.com/404#webpage",
        "name": title,
        "description": description,
        "url": canonical
      }
    ]
  };

  const crawlMarkup = `
    <div id="ssr-404-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
      <nav aria-label="Breadcrumb">
        <a href="/">Home</a> / <span>404 Not Found</span>
      </nav>
      <h1>404 - Page Not Found</h1>
      <p>${description}</p>
      <section>
        <h2>Popular Destinations & Helpful Links</h2>
        <ul>
          <li><a href="/">Local Surge SEO Homepage</a></li>
          <li><a href="/seo-tool">Free Local SEO Audit & Scan Tool</a></li>
          <li><a href="/pricing">Local SEO Pricing & Monthly Packages</a></li>
          <li><a href="/local-seo">Local SEO Optimization Services</a></li>
          <li><a href="/case-studies">Client Case Studies & Verified Results</a></li>
          <li><a href="/locations">U.S. Local Search Markets Directory</a></li>
          <li><a href="/blog">Local Marketing Insights & GEO Blog</a></li>
          <li><a href="/contact">Contact Our Strategists</a></li>
        </ul>
      </section>
    </div>
  `;

  let html404 = injectMetadataAndFallback(rawHtml, title, description, canonical, ogImage, schemaJson, crawlMarkup);
  // Deny robots indexing on 404 error pages
  html404 = html404.replace('</head>', `  <meta name="robots" content="noindex, follow" />\n  </head>`);

  return html404;
}

export interface PrerenderResult {
  html: string;
  status: number;
  is404: boolean;
}

export function prerenderLocationHtmlWithStatus(rawHtml: string, requestPath: string): PrerenderResult {
  const cleanPath = requestPath.split('?')[0].replace(/\/$/, '') || '/';

  // Home route
  if (cleanPath === '' || cleanPath === '/') {
    return { html: rawHtml, status: 200, is404: false };
  }

  // Admin route (noindex)
  if (cleanPath === '/admin' || cleanPath === '/admin/dashboard') {
    let result = rawHtml;
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>Admin Lead Dashboard - Local Surge SEO</title>`);
    result = result.replace('</head>', `  <meta name="robots" content="noindex, nofollow" />\n</head>`);
    return { html: result, status: 200, is404: false };
  }

  const renderedHtml = prerenderLocationHtml(rawHtml, requestPath);

  if (renderedHtml.includes('id="ssr-404-content"')) {
    return { html: renderedHtml, status: 404, is404: true };
  }

  return { html: renderedHtml, status: 200, is404: false };
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

  // Ensure lang="en-US"
  result = result.replace(/<html(\s+[^>]*)?lang=["'][^"']*["']/i, '<html$1lang="en-US"');

  // Replace or Add Canonical
  if (result.includes('<link rel="canonical"')) {
    result = result.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  } else {
    result = result.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n  </head>`);
  }

  // Replace or Add Hreflang Alternates (en-US self-referencing and x-default fallback)
  if (result.includes('hreflang="en-US"')) {
    result = result.replace(/<link\s+rel=["']alternate["']\s+hreflang=["']en-US["']\s+href=["'][^"']*["']\s*\/?>/i, `<link rel="alternate" hreflang="en-US" href="${canonical}" />`);
  } else {
    result = result.replace('</head>', `  <link rel="alternate" hreflang="en-US" href="${canonical}" />\n  </head>`);
  }

  if (result.includes('hreflang="x-default"')) {
    result = result.replace(/<link\s+rel=["']alternate["']\s+hreflang=["']x-default["']\s+href=["'][^"']*["']\s*\/?>/i, `<link rel="alternate" hreflang="x-default" href="${canonical}" />`);
  } else {
    result = result.replace('</head>', `  <link rel="alternate" hreflang="x-default" href="${canonical}" />\n  </head>`);
  }

  // Replace OpenGraph Title & Description & Image
  result = result.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  result = result.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  result = result.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  result = result.replace(/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />\n  <meta property="og:image:alt" content="${title}" />`);

  // Inject JSON-LD Schema
  const schemaString = `\n  <script type="application/ld+json">\n  ${JSON.stringify(schemaJson, null, 2)}\n  </script>\n`;
  result = result.replace('</head>', `${schemaString}</head>`);

  // Inject Crawlable Pre-Rendered HTML inside #root (replacing generic fallback if present)
  if (result.includes('id="ssr-fallback-default"')) {
    result = result.replace(/<div id="ssr-fallback-default"[\s\S]*?<\/div>\s*<\/div>/i, `${crawlMarkup}\n    </div>`);
  } else {
    result = result.replace('<div id="root">', `<div id="root">\n${crawlMarkup}`);
  }

  return result;
}
