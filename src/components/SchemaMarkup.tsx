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
