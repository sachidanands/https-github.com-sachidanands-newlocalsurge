import React from 'react';
import { Page, Plan } from '../types';
import { BLOG_POSTS, BlogPost } from '../data/blogData';

interface SchemaMarkupProps {
  currentPage: Page;
  activeArticleSlug: string | null;
  activeStateSlug: string | null;
  activeCitySlug: string | null;
  plans: Plan[];
}

export default function SchemaMarkup({
  currentPage,
  activeArticleSlug,
  activeStateSlug,
  activeCitySlug,
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
    'telephone': '+18005550199',
    'priceRange': '$$',
    'knowsAbout': [
      'Search Engine Optimization',
      'Local SEO',
      'Google Maps Marketing',
      'Web Design',
      'Google Business Profile Optimization',
      'Citation Building',
      'Structured Local Schema Markup'
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
        '@type': 'AdministrativeArea',
        'name': 'San Jose, CA'
      },
      {
        '@type': 'AdministrativeArea',
        'name': 'Los Angeles, CA'
      },
      {
        '@type': 'AdministrativeArea',
        'name': 'California'
      }
    ],
    'description': 'High-performance web design and local SEO optimization suite for contractors, dentists, plumbers, and local service providers looking to dominate regional query hierarchies.'
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
    } else if (currentPage === 'california') {
      addBreadcrumb('California SEO Directory', '/california');
    } else if (currentPage === 'los-angeles-seo') {
      addBreadcrumb('California SEO', '/california');
      addBreadcrumb('Los Angeles SEO Services', '/los-angeles-seo');
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
        'name': 'How long does Local SEO take to render visible Google Map results?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Typically local rankings begin shifting within 1 to 2 weeks post Google Business Profile synchronization and initial Tier-1 citation publication. Substantial local lead growth is structured over 30 to 60 days as citation networks and localized schema bindings propagate index-wide.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the core value contribution of Local Business schemas?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Schemas translate normal web content into structured JSON-LD payloads. This instructs search engine spiders exactly about your name, phone index, regional operating coordinates, matching services catalogs, and core boundaries without guessing.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Does the Single-Page Blast require a monthly recurring subscription?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No, our Single-Page Blast website plan has zero upfront and recurring platform model charges. It provides an immediate premium mobile-optimized single-scroll landing sandbox designed to maximize conversions.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How are local business citations audited and published?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Our staff matches historical structures looking for typos or invalid NAP profiles. Then we sync identical parameters directly with 20+ primary regional directories (Yelp, Apple Maps, YellowPages,Bing Places) ensuring perfect consistency.'
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
  const getBlogPostSchema = (post: BlogPost) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${siteUrl}/blog/${post.slug}`
      },
      'headline': post.title,
      'description': post.description,
      'image': post.image,
      'datePublished': '2026-04-10T12:00:00+00:00', // standard structured crawl dates format
      'dateModified': '2026-06-13T09:00:00+00:00',
      'author': {
        '@type': 'Person',
        'name': post.author.name,
        'jobTitle': post.author.role
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

  // Select which schemas to compile depending on active view
  const getActiveSchemas = () => {
    const schemas: any[] = [businessSchema, getBreadcrumbs()];

    if (currentPage === 'pricing') {
      schemas.push(getOfferCatalog());
    }

    if (currentPage === 'home' || currentPage === 'why-us' || currentPage === 'seo-tool') {
      schemas.push(getFAQSchema());
    }

    if (currentPage === 'blog' && activeArticleSlug) {
      const activePost = BLOG_POSTS.find(p => p.slug === activeArticleSlug);
      if (activePost) {
        schemas.push(getBlogPostSchema(activePost));
      }
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
