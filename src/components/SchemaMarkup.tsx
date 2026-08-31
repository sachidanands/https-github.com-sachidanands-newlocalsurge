import React from 'react';
import { Page, Plan } from '../types';
import { BLOG_POSTS, BlogPost } from '../data/blogData';
import { STATE_DIRECTORY, CITY_DIRECTORY, StateData, CityData } from '../data/directoryData';
import { getStateBySlug, getDistrictBySlug } from '../data/locationsData';

interface SchemaMarkupProps {
  currentPage: Page;
  activeArticleSlug: string | null;
  activeStateSlug: string | null;
  activeCitySlug: string | null;
  activeDemoSlug?: string | null;
  plans: Plan[];
}

export default function SchemaMarkup({
  currentPage,
  activeArticleSlug,
  activeStateSlug,
  activeCitySlug,
  activeDemoSlug,
  plans
}: SchemaMarkupProps) {

  // Base site metadata definitions
  const siteUrl = 'https://localsurgeseo.com';
  const orgName = 'Local Surge SEO';
  const orgLogo = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';

  // 1. Core Organization & ProfessionalService Business Schema
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/#organization`,
    'name': orgName,
    'url': siteUrl,
    'logo': orgLogo,
    'image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    'telephone': '+19097075075',
    'priceRange': '$$',
    'knowsAbout': [
      'Search Engine Optimization',
      'Local SEO',
      'Google Maps Marketing',
      'Web Design',
      'Google Business Profile Optimization',
      'Citation Building',
      'Structured Local Schema Markup',
      'Generative Engine Optimization (GEO)',
      'AI Search Citations',
      'Machine Readable LLM Indexes (llms.txt)',
      'Model Context Protocol (WebMCP)'
    ],
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'San Jose',
      'addressRegion': 'CA',
      'postalCode': '95112',
      'addressCountry': 'US'
    },
    'areaServed': [
      {
        '@type': 'Country',
        'name': 'United States'
      },
      {
        '@type': 'Country',
        'name': 'Canada'
      }
    ],
    'sameAs': [
      'https://www.facebook.com/localsurgeseo',
      'https://www.youtube.com/@LocalSurgeSEO',
      'https://x.com/localsurgeseo'
    ],
    'description': 'High-performance web design and local SEO optimization suite for contractors, dentists, plumbers, and local service providers looking to dominate regional query hierarchies.',
    'potentialAction': [
      {
        '@type': 'Action',
        'name': 'audit_local_seo',
        'description': 'Execute automated Local SEO audit on target domain',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${siteUrl}/api/webmcp/invoke`,
          'actionPlatform': ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform']
        }
      },
      {
        '@type': 'Action',
        'name': 'scan_nap_citations',
        'description': 'Audit local business directory listings for NAP consistency',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${siteUrl}/api/webmcp/invoke`,
          'actionPlatform': ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform']
        }
      },
      {
        '@type': 'Action',
        'name': 'submit_onboarding_lead',
        'description': 'Submit local business SEO strategy onboarding request',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${siteUrl}/api/webmcp/invoke`,
          'actionPlatform': ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform']
        }
      }
    ]
  };

  // 2. Dynamic Breadcrumb List Schema based on routing state
  const getBreadcrumbs = () => {
    const items = [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': siteUrl
      }
    ];

    let pos = 2;

    const addBreadcrumb = (name: string, path: string) => {
      items.push({
        '@type': 'ListItem',
        'position': pos,
        'name': name,
        'item': `${siteUrl}${path}`
      });
      pos++;
    };

    if (currentPage === 'about') {
      addBreadcrumb('About Us', '/about');
    } else if (currentPage === 'why-us') {
      addBreadcrumb('Why Us', '/why-us');
    } else if (currentPage === 'local-seo') {
      addBreadcrumb('SEO Services', '/local-seo');
    } else if (currentPage === 'pricing') {
      addBreadcrumb('Pricing & Plans', '/pricing');
    } else if (currentPage === 'seo-tool') {
      addBreadcrumb('Local SEO Audit Tool', '/seo-tool');
    } else if (currentPage === 'contact') {
      addBreadcrumb('Contact Team', '/contact');
    } else if (currentPage === 'site-map') {
      addBreadcrumb('Directory Sitemap', '/site-map');
    } else if (currentPage === 'case-studies') {
      addBreadcrumb('Local SEO Case Studies & Success Stories', '/case-studies');
    } else if (currentPage === 'privacy-policy') {
      addBreadcrumb('Privacy Policy', '/privacy-policy');
    } else if (currentPage === 'terms-of-service') {
      addBreadcrumb('Terms of Service', '/terms-of-service');
    } else if (currentPage === 'locations-index') {
      addBreadcrumb('Locations & Market Studies', '/locations');
    } else if (currentPage === 'locations-state' || currentPage === 'california') {
      addBreadcrumb('Locations & Market Studies', '/locations');
      const stSlug = activeStateSlug || 'california';
      const stateObj = getStateBySlug(stSlug);
      addBreadcrumb(stateObj ? stateObj.name : stSlug.charAt(0).toUpperCase() + stSlug.slice(1), `/locations/${stSlug}/`);
    } else if (currentPage === 'locations-district' || currentPage === 'los-angeles-seo') {
      addBreadcrumb('Locations & Market Studies', '/locations');
      const stSlug = activeStateSlug || 'california';
      const cSlug = activeCitySlug || 'los-angeles';
      const stateObj = getStateBySlug(stSlug);
      const distObj = getDistrictBySlug(cSlug);
      addBreadcrumb(stateObj ? stateObj.name : stSlug.charAt(0).toUpperCase() + stSlug.slice(1), `/locations/${stSlug}/`);
      addBreadcrumb(distObj ? `${distObj.name} Local SEO` : cSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), `/locations/${stSlug}/${cSlug}`);
    } else if (currentPage === 'demo') {
      addBreadcrumb('Solutions & Demos', '/pricing');
      const demoNames: Record<string, string> = {
        'contractor-surge': 'Contractor Single-Page Demo',
        'dental-surge': 'Dental Practice Single-Page Demo',
        'legal-surge': 'Legal Practice Single-Page Demo'
      };
      const dLabel = (activeDemoSlug && demoNames[activeDemoSlug]) || 'Single-Page Showcase';
      addBreadcrumb(dLabel, activeDemoSlug ? `/demo/${activeDemoSlug}` : '/pricing');
    } else if (currentPage === 'blog') {
      addBreadcrumb('Local Marketing Insights Blog', '/blog');
      if (activeArticleSlug) {
        const post = BLOG_POSTS.find(p => p.slug === activeArticleSlug);
        if (post) {
          addBreadcrumb(post.title, `/blog/${post.slug}`);
        }
      }
    } else if (currentPage === 'state-seo' && activeStateSlug) {
      const stateName = activeStateSlug.charAt(0).toUpperCase() + activeStateSlug.slice(1);
      addBreadcrumb(`${stateName} SEO Catalog`, `/${activeStateSlug}`);
    } else if (currentPage === 'city-seo' && activeStateSlug && activeCitySlug) {
      const stateName = activeStateSlug.charAt(0).toUpperCase() + activeStateSlug.slice(1);
      const cityName = activeCitySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      addBreadcrumb(`${stateName} SEO Catalog`, `/${activeStateSlug}`);
      addBreadcrumb(`${cityName} Local Authority Suite`, `/${activeStateSlug}/${activeCitySlug}`);
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items
    };
  };

  // 3. Live OfferCatalog & Product schemas detail pricing tier structures
  const getOfferCatalog = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      'name': 'Local Surge SEO Optimization and Development Services',
      'itemListElement': plans.map((plan, index) => ({
        '@type': 'Offer',
        'position': index + 1,
        'itemOffered': {
          '@type': 'Service',
          'name': plan.name,
          'description': plan.description,
          'provider': {
            '@type': 'ProfessionalService',
            'name': orgName,
            'url': siteUrl
          },
          'offers': {
            '@type': 'Offer',
            'price': plan.price.toString(),
            'priceCurrency': 'USD',
            'category': 'Search Engine Optimization (SEO)',
            'priceSpecification': {
              '@type': 'UnitPriceSpecification',
              'price': plan.price,
              'priceCurrency': 'USD',
              'referenceQuantity': {
                '@type': 'QuantitativeValue',
                'value': 1,
                'unitCode': 'MON'
              }
            }
          }
        }
      }))
    };
  };

  // 4. Dynamic FAQ Page Schema for immediate crawling rich answers
  const getFAQSchema = () => {
    const list = [
      {
        '@type': 'Question',
        'name': 'How can I get a free website for my business?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'You can launch a free, SEO-optimized single-page website instantly with LocalSurge SEO’s "Single-Page Blast" plan. Simply click "Select Plan," fill out the brief business form, and share your details to get started immediately.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What information do I need to provide to build my site quickly?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'To fast-track your website creation, please prepare the following details: - A brief description of your business. - Your physical business address. - Links to your social media profiles (if available). - Your business contact phone number. - 5 Common Questions local customers ask you. - Your preferred color theme or branding style for website. - Your desired domain name (optional).'
        }
      },
      {
        '@type': 'Question',
        'name': 'Do I need to purchase a custom domain name?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No, a custom domain is not required. You can utilize our free subdomain structure, such as localsurgeseo.com/your-business-name, which is perfect for establishing an immediate local presence.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Why is having a custom domain beneficial if I can use a free subdomain?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'In the era of AI and advanced search algorithms, a dedicated domain (e.g., yourbusiness.com) significantly strengthens your digital identity and authority. It signals trust to both customers and search engines, making it easier to rank higher for local keywords compared to a subdomain.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can I upgrade my plan if my business grows?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Absolutely. You have the flexibility to switch from the free single-page plan to a paid plan at any time as your digital presence and needs expand.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Does the free plan support multiple pages?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No, the free "Single-Page Blast" plan is designed specifically as a high-converting one-page website. If you require a multi-page structure, you can upgrade to a higher-tier plan.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How often can I update the content on my free website?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'To ensure content freshness and optimal SEO performance, you are allowed to update your website content once per month under the free plan.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What post-launch support does LocalSurge SEO provide?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We don\'t just build the site; we help you succeed. LocalSurge SEO support includes assistance with: - Optimizing your Core Web Vitals (CWV) score for faster loading and better rankings. - Implementing Local Schema markup to help Google understand your business. - Refining your content based on local search intent and business specifics.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What components are included in my single-page website?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Your single-page website comes with 10 essential components designed to convert visitors into customers: - Header Navigation: Easy access to key sections. - Hero Section: A compelling headline and call-to-action. - About Us: Your business story. - Why Choose Us: Your unique selling propositions. - Our Work/Portfolio: Showcase up to 10 images of your products or projects. - FAQ Section: Answers to common customer inquiries. - Footer: Essential links and copyright info. - Call to Action (CTA): Prominent buttons for customers to call you directly. - Contact Info: Clear display of phone and address. - Local SEO Tags: Hidden metadata optimized for search engines.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How does Local Surge SEO help my business get cited by AI search engines like ChatGPT and Perplexity?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Local Surge SEO deploys machine-readable indexes (/llms.txt, /pricing.md), JSON-LD structured schemas, and 40-60 word answer blocks optimized for Generative Engine Optimization (GEO). This makes your business data directly parseable by AI bots, helping you get cited in conversational AI search results.'
        }
      }
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': list
    };
  };

  // Dynamic FAQ Page Schema for the Local SEO page
  const getLocalSeoFAQSchema = () => {
    const list = [
      {
        '@type': 'Question',
        'name': 'Is SEO dead or evolving in 2026?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No, SEO is not dead—it has transitioned into Generative Engine Optimization (GEO). Search platforms (like ChatGPT, Gemini, and Perplexity) rely on the same coordinates, structured schemas, and verified citations to answer local queries. If your structured data is missing, AI will ignore your business.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Will SEO be replaced by AI?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'AI is augmenting search behaviors, but it is not replacing the need for local rankings. Instead of links, AI provides single direct recommendations. Winning that sole recommendation requires an even stronger local authority signal, perfect citation mapping, and high review trust.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Does local SEO still work and is it worth it?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Local SEO delivers the highest ROI of any digital channel because it targets buyers at the exact moment they require emergency assistance or specialized local services near them. Unlike temporary pay-per-click ads, local SEO builds permanent authority.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the 80/20 rule of SEO?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '80% of local SEO map pack conversions come from 20% of your optimization actions. Focus on Name-Address-Phone (NAP) alignment, matching category selections, and local structured JSON-LD schema coordination rather than vanity backlinks.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How much do local SEO services cost?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Professional local SEO services run between $500 and $2,000 monthly, depending on competitive density. Valid campaigns pay for themselves rapidly as local listings generate organic customer phone calls.'
        }
      }
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': list
    };
  };

  // 5. Rich Blog Article BlogPostings Scheme
  const formatIsoDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T12:00:00+00:00`;
      }
    } catch (err) { }
    return '2026-06-20T12:00:00+00:00';
  };

  // 5. Rich Blog Article BlogPostings Scheme
  const getBlogPostSchema = (post: BlogPost) => {
    const isoDate = formatIsoDate(post.date);
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${siteUrl}/blog/${post.slug}`
      },
      'headline': post.title,
      'description': post.description,
      'image': post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`,
      'datePublished': isoDate,
      'dateModified': isoDate,
      'author': {
        '@type': 'Person',
        'name': post.author.name,
        'jobTitle': post.author.role,
        'worksFor': {
          '@type': 'Organization',
          'name': orgName,
          'url': siteUrl
        },
        'sameAs': [
          'https://x.com/localsurgeseo',
          'https://www.youtube.com/@LocalSurgeSEO'
        ]
      },
      'publisher': {
        '@type': 'Organization',
        'name': orgName,
        'logo': {
          '@type': 'ImageObject',
          'url': orgLogo
        }
      }
    };
  };

  // Dynamic FAQPage Question/Answer schema for blog posts
  const getBlogPostFAQSchema = (post: BlogPost) => {
    const qaPairs: { question: string; answer: string }[] = [];

    post.sections.forEach((section, idx) => {
      // Check list items with "Question?: Answer"
      if ((section.type === 'numbered-list' || section.type === 'bullet-list') && Array.isArray(section.items)) {
        section.items.forEach(item => {
          const colonIdx = item.indexOf(':');
          if (colonIdx > 0 && colonIdx < 140) {
            const potentialQ = item.substring(0, colonIdx).replace(/^\d+\.\s*/, '').trim();
            const potentialA = item.substring(colonIdx + 1).trim();
            const isFaqList = section.content.toLowerCase().includes('faq') || 
                              section.content.toLowerCase().includes('question') || 
                              section.content.toLowerCase().includes('paa') ||
                              section.content.toLowerCase().includes('ask');
            if (potentialQ.includes('?') || isFaqList) {
              qaPairs.push({
                question: potentialQ.replace(/[*_#`]/g, ''),
                answer: potentialA.replace(/[*_#`]/g, '')
              });
            }
          }
        });
      }

      // Check heading with '?' followed by paragraph
      if (section.type === 'heading' && section.content.trim().endsWith('?')) {
        const nextSection = post.sections[idx + 1];
        if (nextSection && (nextSection.type === 'paragraph' || nextSection.type === 'alert-box')) {
          qaPairs.push({
            question: section.content.replace(/[*_#`]/g, '').trim(),
            answer: nextSection.content.replace(/[*_#`]/g, '').trim()
          });
        }
      }
    });

    if (qaPairs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': qaPairs.map(qa => ({
        '@type': 'Question',
        'name': qa.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': qa.answer
        }
      }))
    };
  };

  // Localized state schema
  const getLocalizedStateSchema = (state: StateData) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/${state.slug}#division`,
      'name': `${orgName} - ${state.name} Regional Division`,
      'url': `${siteUrl}/${state.slug}`,
      'logo': orgLogo,
      'image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      'telephone': '+19097075075',
      'priceRange': '$$',
      'knowsAbout': [
        'Search Engine Optimization',
        `Local SEO in ${state.name}`,
        `Google Maps Marketing in ${state.name}`,
        'Web Design',
        'Google Business Profile Optimization',
        'Citation Building'
      ],
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': state.name,
        'addressRegion': state.code,
        'addressCountry': state.code === 'ON' || state.code === 'BC' ? 'CA' : 'US'
      },
      'description': `High-performance web design and local SEO optimization division in ${state.name} for local service providers looking to dominate maps ranking grids.`
    };
  };

  // Localized city schema
  const getLocalizedCitySchema = (city: CityData) => {
    const cityNameOnly = city.name.replace(" SEO", "");
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/${city.stateSlug}/${city.slug}#office`,
      'name': `${orgName} - ${cityNameOnly} Office`,
      'url': `${siteUrl}/${city.stateSlug}/${city.slug}`,
      'logo': orgLogo,
      'image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      'telephone': '+19097075075',
      'priceRange': '$$',
      'knowsAbout': [
        'Search Engine Optimization',
        `Local SEO in ${cityNameOnly}`,
        `Google Maps Marketing in ${cityNameOnly}`,
        'Web Design',
        'Google Business Profile Optimization',
        'Citation Building'
      ],
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': cityNameOnly,
        'addressRegion': city.stateCode,
        'addressCountry': city.stateCode === 'ON' || city.stateCode === 'BC' ? 'CA' : 'US'
      },
      'description': `High-performance web design and local SEO optimization suite in ${cityNameOnly}, ${city.stateCode} for local service providers looking to dominate regional query hierarchies.`
    };
  };

  // Select which schemas to compile depending on active view
  const getActiveSchemas = () => {
    const schemas: any[] = [businessSchema, getBreadcrumbs()];

    if (currentPage === 'pricing') {
      schemas.push(getOfferCatalog());
    }

    if (currentPage === 'home' || currentPage === 'why-us' || currentPage === 'seo-tool') {
      schemas.push(getFAQSchema());
    }

    if (currentPage === 'local-seo') {
      schemas.push(getLocalSeoFAQSchema());
    }

    if (currentPage === 'case-studies') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': 'Local Surge SEO Acceleration Services',
        'description': 'Verified client revenue and Google Local 3-Pack rank acceleration results for local service businesses.',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.95',
          'bestRating': '5',
          'ratingCount': '48',
          'reviewCount': '48'
        },
        'review': [
          {
            '@type': 'Review',
            'author': { '@type': 'Person', 'name': 'Robert Martinez' },
            'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
            'reviewBody': '+312% organic Map Pack impressions and 44 new commercial roofing inbound leads per month within 90 days.'
          },
          {
            '@type': 'Review',
            'author': { '@type': 'Person', 'name': 'Dr. Elena Rostova' },
            'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
            'reviewBody': 'Rank #1 in Local 3-Pack for emergency dentist near me with +185% patient appointment requests.'
          }
        ]
      });
    }

    if (currentPage === 'demo') {
      const demoSlug = activeDemoSlug || 'contractor-surge';
      const demoNames: Record<string, { name: string; loc: string }> = {
        'contractor-surge': { name: 'Apex Pro Contractor Services', loc: 'Dallas-Fort Worth, TX' },
        'dental-surge': { name: 'Harbor View Dental Care', loc: 'Miami, FL' },
        'legal-surge': { name: 'Vanguard Regional Legal Group', loc: 'San Jose, CA' }
      };
      const info = demoNames[demoSlug] || {
        name: demoSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Services',
        loc: 'San Jose, CA'
      };

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': info.name,
        'description': 'High-performance local business single-page website demo built by Local Surge SEO.',
        'url': `${siteUrl}/demo/${demoSlug}`,
        'telephone': '+1-909-707-5075',
        'priceRange': '$$',
        'currenciesAccepted': 'USD',
        'paymentAccepted': 'Credit Card, Debit Card, Invoice',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': info.loc.split(',')[0].trim(),
          'addressRegion': info.loc.split(',')[1]?.trim() || "CA",
          'addressCountry': 'US'
        }
      });
    }

    if (currentPage === 'blog' && activeArticleSlug) {
      const activePost = BLOG_POSTS.find(p => p.slug === activeArticleSlug);
      if (activePost) {
        schemas.push(getBlogPostSchema(activePost));
        const faqSchema = getBlogPostFAQSchema(activePost);
        if (faqSchema) {
          schemas.push(faqSchema);
        }
      }
    }

    if (currentPage === 'state-seo' && activeStateSlug) {
      const state = STATE_DIRECTORY[activeStateSlug];
      if (state) {
        schemas.push(getLocalizedStateSchema(state));
      }
    }

    if (currentPage === 'city-seo' && activeCitySlug) {
      const city = CITY_DIRECTORY[activeCitySlug];
      if (city) {
        schemas.push(getLocalizedCitySchema(city));
      }
    }

    if (currentPage === 'seo-tool') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Local Surge SEO Diagnostic & AI Readiness Suite',
        'operatingSystem': 'All',
        'applicationCategory': 'BusinessApplication',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'description': 'Automated real-time local search signal diagnostic, citation audit, and AI search readiness scanner.'
      });
    }

    return schemas;
  };

  const activeSchemas = getActiveSchemas();

  return (
    <>
      {activeSchemas.map((schema, index) => {
        const key = `schema-ld-json-${index}-${currentPage}`;
        return (
          <script
            id={key}
            key={key}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        );
      })}
    </>
  );
}
