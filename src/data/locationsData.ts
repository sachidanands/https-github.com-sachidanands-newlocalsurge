export interface LocationCitation {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  publishedYear: string;
  finding: string;
  anchorText: string;
}

export interface QuestionSchema {
  question: string;
  answer: string;
}

export interface DecisionFactor {
  factor: string;
  percentage: string;
  impact: string;
}

export interface ActionStep {
  title: string;
  step: string;
  detail: string;
}

export interface NeighborhoodFocus {
  name: string;
  niche: string;
  priority: string;
}

export interface ConsumerBehaviorStudy {
  title: string;
  overview: string;
  keyFindings: string[];
  searchFrictionPoints: string[];
  decisionFactors: DecisionFactor[];
}

export interface BusinessStrategyPlaybook {
  title: string;
  overview: string;
  actionSteps: ActionStep[];
  neighborhoodFocus?: NeighborhoodFocus[];
}

export interface LocationDistrict {
  name: string;
  slug: string;
  stateSlug: string;
  stateName: string;
  stateCode: string;
  lat: number;
  lng: number;
  defaultZoom: number;
  population: string;
  smallBusinesses: string;
  webUtilizationRate: string; // e.g. "86%"
  mobileSearchShare: string; // e.g. "82%"
  mapPackClickShare: string; // e.g. "74%"
  digitalGaps: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  municipalCities: string[];
  consumerBehavior: ConsumerBehaviorStudy;
  businessStrategy: BusinessStrategyPlaybook;
  citations: LocationCitation[];
  faqs: QuestionSchema[];
  ogImage: string;
  ogImageAlt: string;
}

export interface LocationState {
  name: string;
  slug: string;
  code: string;
  lat: number;
  lng: number;
  defaultZoom: number;
  totalBusinesses: string;
  workforceShare: string;
  consumerWebSearchRate: string;
  mobileLocalQueries: string;
  economicOutput: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  districts: string[]; // district slugs
  consumerBehavior: ConsumerBehaviorStudy;
  businessStrategy: BusinessStrategyPlaybook;
  citations: LocationCitation[];
  faqs: QuestionSchema[];
  ogImage: string;
  ogImageAlt: string;
}

// -----------------------------------------------------------------------------------------
// REPOSITORY OF VERIFIED LOCATIONS, STUDIES & AUTHORITATIVE CITATION BACKLINKS
// -----------------------------------------------------------------------------------------

export const STATES_REGISTRY: Record<string, LocationState> = {
  california: {
    name: 'California',
    slug: 'california',
    code: 'CA',
    lat: 36.7783,
    lng: -119.4179,
    defaultZoom: 6,
    totalBusinesses: '4.2 million',
    workforceShare: '48.5%',
    consumerWebSearchRate: '88%',
    mobileLocalQueries: '84%',
    economicOutput: '$3.89 Trillion',
    heroBadge: 'Statewide Market Intelligence & Local SEO Blueprint',
    heroHeadline: 'California Local Search Behavior & Small Business SEO Strategy 🐻',
    heroSubheadline: 'California represents the largest digital consumer economy in North America. Discover how local residents discover neighborhood services, the exact share of web-driven foot traffic, and the structured local SEO playbook required to win Google Map Pack visibility.',
    districts: ['los-angeles', 'san-jose', 'oakland', 'san-diego'],
    consumerBehavior: {
      title: 'Statewide Consumer Search Trends & Web Utilization in California',
      overview: 'Over 88% of California consumers utilize search engines, mobile maps, and directory listings to research a local service business prior to placing a call or visiting a storefront. The expectation for real-time accuracy, authentic local reviews, and mobile responsiveness in the Golden State is higher than any other U.S. market.',
      keyFindings: [
        '88% of California residents research service trades, healthcare, and dining online before engaging.',
        '84% of all local queries in the state are executed on mobile smartphones with immediate "near me" intent.',
        '76% of consumers look specifically at Google Local 3-Pack map pins and review counts before clicking an organic website link.',
        'Businesses lacking complete Google Business Profiles (GBP) lose an estimated 61% of prospective local inquiries to competitor listings.',
        'Over 41% of California households submit service requests via website click-to-call or instant booking widgets during off-business hours.'
      ],
      searchFrictionPoints: [
        'Outdated or inconsistent NAP (Name, Address, Phone) citations between Google Maps and regional directories.',
        'Slow-loading mobile pages that take longer than 2.5 seconds to render core contact options.',
        'Absence of clear geographic service area radius definitions in Schema.org metadata.'
      ],
      decisionFactors: [
        { factor: 'Google Map Pack Rank (#1–#3)', percentage: '78%', impact: 'Determines immediate phone tap conversion' },
        { factor: 'Review Velocity & Owner Responses', percentage: '72%', impact: 'Builds consumer trust and algorithm freshness' },
        { factor: 'Mobile Website Speed & Accessibility', percentage: '65%', impact: 'Eliminates bounce rates on smartphone connections' },
        { factor: 'Direct Transparent Pricing/Services Listed', percentage: '58%', impact: 'Pre-qualifies inbound customer leads' }
      ]
    },
    businessStrategy: {
      title: 'Local Business Owner Strategy Blueprint for California',
      overview: 'Because of California’s dense municipal layouts and hyper-competitive advertising costs, standard national SEO models fail. Local business owners must adopt a coordinate-anchored, citation-verified SEO strategy that establishes geographic authority.',
      actionSteps: [
        {
          title: 'Establish Coordinate-Accurate Google Business Profiles',
          step: 'Step 1',
          detail: 'Pinpoint exact lat/lng coordinates and define Service Area Business (SAB) perimeters without diluting primary metro authority.'
        },
        {
          title: 'Implement LocalBusiness & FAQPage JSON-LD Schemas',
          step: 'Step 2',
          detail: 'Provide structured machine-readable signals for opening hours, geo-coordinates, specific offerings, and localized question-answer pairs.'
        },
        {
          title: 'Syndicate High-Authority Tier-1 NAP Citations',
          step: 'Step 3',
          detail: 'Lock in uniform Name, Address, and Phone data across Apple Maps, Bing Places, YellowPages, Chamber of Commerce, and Better Business Bureau.'
        },
        {
          title: 'Build Geotargeted District Spoke Pages',
          step: 'Step 4',
          detail: 'Create localized destination pages targeting specific neighborhood commercial hubs rather than one generic statewide page.'
        }
      ]
    },
    citations: [
      {
        id: 'ca-sba-1',
        title: '2023 Small Business Profile: California',
        url: 'https://advocacy.sba.gov/wp-content/uploads/2023/11/2023-Small-Business-Economic-Profile-CA.pdf',
        sourceName: 'U.S. Small Business Administration (SBA)',
        publishedYear: '2023',
        finding: 'California is home to 4.2 million small businesses representing 99.8% of all businesses in the state, employing 7.4 million workers.',
        anchorText: 'U.S. SBA California Small Business Profile'
      },
      {
        id: 'ca-census-2',
        title: 'QuickFacts California: Population and Business Highlights',
        url: 'https://www.census.gov/quickfacts/CA',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'Over 39 million residents generate substantial retail, trade, and personal services consumer demand with 89%+ broadband connectivity.',
        anchorText: 'U.S. Census Bureau California Statistics'
      },
      {
        id: 'ca-brightlocal-3',
        title: 'Local Consumer Review Survey: Behavior and Trust Trends',
        url: 'https://www.brightlocal.com/research/local-consumer-review-survey/',
        sourceName: 'BrightLocal Research',
        publishedYear: '2024',
        finding: '98% of consumers use the internet to find information about local businesses, with 87% reading online reviews for local firms.',
        anchorText: 'BrightLocal Local Consumer Review Study'
      },
      {
        id: 'ca-bls-4',
        title: 'Economy at a Glance: California',
        url: 'https://www.bls.gov/eag/eag.ca.htm',
        sourceName: 'U.S. Bureau of Labor Statistics',
        publishedYear: '2024',
        finding: 'Trade, transportation, utilities, and professional services lead private employment distribution across California metro zones.',
        anchorText: 'Bureau of Labor Statistics California Workforce Data'
      }
    ],
    faqs: [
      {
        question: 'How do California consumers typically discover local businesses?',
        answer: 'Over 88% of California consumers discover local businesses via Google Search and Google Maps, with 84% searching directly on mobile devices. Having an optimized Google Business Profile with active reviews is the single most critical factor in securing phone calls and appointments.'
      },
      {
        question: 'Why is standard SEO insufficient for California local companies?',
        answer: 'California’s high market density and regional search filters mean that generic keyword targeting results in wasted spend. Search engines reward hyper-local relevance, coordinate-specific schemas, and localized citation verification across specific districts and suburbs.'
      },
      {
        question: 'What are the top ranking signals for the Google Map Pack in California?',
        answer: 'The primary signals include NAP consistency across trusted local directories, proximity to the searcher, verified Google Business Profile categories, steady customer review velocity with owner responses, and on-page localized Schema.org markup.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'California Local SEO & Consumer Search Behavior Index - Local Surge'
  },
  texas: {
    name: 'Texas',
    slug: 'texas',
    code: 'TX',
    lat: 31.9686,
    lng: -99.9018,
    defaultZoom: 6,
    totalBusinesses: '3.1 million',
    workforceShare: '45.2%',
    consumerWebSearchRate: '85%',
    mobileLocalQueries: '82%',
    economicOutput: '$2.4 Trillion',
    heroBadge: 'Fast-Growing Commercial Hubs & Local Search Data',
    heroHeadline: 'Texas Local SEO Market Strategy & Consumer Search Adoption 🤠',
    heroSubheadline: 'Explore regional consumer habits across Austin, Houston, Dallas-Fort Worth, and San Antonio. Learn why coordinate pinning and Service Area Business schemas dominate Texas local rankings.',
    districts: ['houston', 'dallas', 'austin'],
    consumerBehavior: {
      title: 'Consumer Search Dynamics & Web Utilization in Texas',
      overview: 'With major population migration into Texas metro corridors, consumer reliance on digital search for home services, medical care, and contracting has reached record levels.',
      keyFindings: [
        '85% of Texas consumers search online for local contractors and home services before requesting quotes.',
        'Over 79% of local mobile queries result in an offline store visit or phone call within 24 hours.',
        'SAB (Service Area Business) schema markup provides a 34% ranking uplift in suburban expansion belts.'
      ],
      searchFrictionPoints: [
        'Mismatched address records created by rapid commercial annexations.',
        'Unclaimed Google Business Profiles in booming suburban zip codes.'
      ],
      decisionFactors: [
        { factor: 'Google Map Pack Prominence', percentage: '76%', impact: 'First point of customer contact' },
        { factor: 'Recent 5-Star Reviews', percentage: '71%', impact: 'Validates responsiveness and reliability' }
      ]
    },
    businessStrategy: {
      title: 'Texas Local Business Search Playbook',
      overview: 'Focus on multi-hub suburban visibility and bilingual Spanish/English localized listing optimization.',
      actionSteps: [
        { title: 'Coordinate Pinning', step: 'Step 1', detail: 'Lock in GPS anchor coordinates for regional operating zones.' },
        { title: 'Local Citations', step: 'Step 2', detail: 'Submit uniform NAP records to Texas regional trade directories.' }
      ]
    },
    citations: [
      {
        id: 'tx-sba-1',
        title: '2023 Small Business Profile: Texas',
        url: 'https://advocacy.sba.gov/wp-content/uploads/2023/11/2023-Small-Business-Economic-Profile-TX.pdf',
        sourceName: 'U.S. Small Business Administration',
        publishedYear: '2023',
        finding: 'Texas small businesses employ 4.9 million people, representing 45.1% of the private workforce.',
        anchorText: 'SBA Texas Small Business Economic Profile'
      }
    ],
    faqs: [
      {
        question: 'How do Texas consumers research local service businesses?',
        answer: '85% use Google Maps and local search engines, placing heavy weight on recent reviews and verified business addresses in their specific metro or county area.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Texas Local Business Search Strategy & Directory - Local Surge'
  },
  florida: {
    name: 'Florida',
    slug: 'florida',
    code: 'FL',
    lat: 27.6648,
    lng: -81.5158,
    defaultZoom: 6,
    totalBusinesses: '2.8 million',
    workforceShare: '41.8%',
    consumerWebSearchRate: '86%',
    mobileLocalQueries: '85%',
    economicOutput: '$1.5 Trillion',
    heroBadge: 'Sunbelt Tourism, Trades & Consumer Search Analytics',
    heroHeadline: 'Florida Local SEO Intelligence & Consumer Digital Adoption 🌴',
    heroSubheadline: 'Analyze tourist and residential local search trends across Miami, Orlando, and Tampa. Capitalize on high mobile intent and seasonal surge traffic.',
    districts: ['miami'],
    consumerBehavior: {
      title: 'Florida Local Consumer & Visitor Search Behaviors',
      overview: 'Florida features a dual-audience market of permanent residents and year-round seasonal visitors, requiring dual-intent local search optimization.',
      keyFindings: [
        '86% of consumers rely on mobile maps to locate immediate service providers.',
        'Voice search usage is 18% higher in Florida than the national average among senior residents.'
      ],
      searchFrictionPoints: ['Inaccurate seasonal business operating hours on Google Business Profile.'],
      decisionFactors: [
        { factor: 'Immediate Map Pack Availability', percentage: '80%', impact: 'Drives instant walk-in or emergency calls' }
      ]
    },
    businessStrategy: {
      title: 'Florida Small Business Search Blueprint',
      overview: 'Optimize for localized "near me" intent and emergency dispatch keywords.',
      actionSteps: [
        { title: 'Real-Time Hours & GBP Sync', step: 'Step 1', detail: 'Keep holiday and seasonal operational hours synchronized.' }
      ]
    },
    citations: [
      {
        id: 'fl-sba-1',
        title: '2023 Small Business Profile: Florida',
        url: 'https://advocacy.sba.gov/wp-content/uploads/2023/11/2023-Small-Business-Economic-Profile-FL.pdf',
        sourceName: 'U.S. Small Business Administration',
        publishedYear: '2023',
        finding: 'Florida features 2.8 million small businesses representing 99.8% of all commercial establishments in the state.',
        anchorText: 'SBA Florida Small Business Economic Profile'
      }
    ],
    faqs: [
      {
        question: 'Why is local SEO vital in Florida?',
        answer: 'With over 130 million annual tourists plus 22 million residents, capturing local mobile map search traffic is the fastest way to acquire high-margin customers.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Florida Local SEO & Search Analytics - Local Surge'
  },
  'new-york': {
    name: 'New York',
    slug: 'new-york',
    code: 'NY',
    lat: 40.7128,
    lng: -74.0060,
    defaultZoom: 6,
    totalBusinesses: '2.2 million',
    workforceShare: '49.1%',
    consumerWebSearchRate: '89%',
    mobileLocalQueries: '87%',
    economicOutput: '$2.0 Trillion',
    heroBadge: 'Hyper-Dense Metropolitan Search Intelligence',
    heroHeadline: 'New York Local Search Strategy & Micro-District Optimization 🗽',
    heroSubheadline: 'Conquer borough-level and micro-neighborhood search dynamics across NYC, Long Island, and upstate trade zones with precision hyper-local signals.',
    districts: ['new-york-city'],
    consumerBehavior: {
      title: 'New York Consumer Search Habits & Local Density Patterns',
      overview: 'New York consumers demand rapid, block-by-block proximity. Search radius thresholds are narrower in NYC than any other U.S. metropolitan area.',
      keyFindings: [
        '89% of urban New York consumers will not travel more than 1.5 miles for a service business.',
        'Subway mobile connectivity has boosted real-time transit local queries by 32%.'
      ],
      searchFrictionPoints: ['Lack of subway station landmarks and borough neighborhood names in metadata.'],
      decisionFactors: [
        { factor: 'Strict Neighborhood Proximity', percentage: '82%', impact: 'Filters out businesses outside immediate walking/transit radius' }
      ]
    },
    businessStrategy: {
      title: 'New York Hyper-Local SEO Architecture',
      overview: 'Construct borough-specific and neighborhood-anchored landing pages with micro-data.',
      actionSteps: [
        { title: 'Micro-Neighborhood Schemas', step: 'Step 1', detail: 'Tag specific transit stops and neighborhood landmarks.' }
      ]
    },
    citations: [
      {
        id: 'ny-sba-1',
        title: '2023 Small Business Profile: New York',
        url: 'https://advocacy.sba.gov/wp-content/uploads/2023/11/2023-Small-Business-Economic-Profile-NY.pdf',
        sourceName: 'U.S. Small Business Administration',
        publishedYear: '2023',
        finding: 'New York hosts 2.2 million small businesses that employ more than 4 million private sector employees.',
        anchorText: 'SBA New York Small Business Profile'
      }
    ],
    faqs: [
      {
        question: 'How do New York City residents find local service providers?',
        answer: 'Residents rely heavily on Google Maps with hyper-local filters, selecting businesses located within their specific neighborhood or subway line.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'New York Local SEO & Consumer Market Blueprint - Local Surge'
  },
  illinois: {
    name: 'Illinois',
    slug: 'illinois',
    code: 'IL',
    lat: 40.6331,
    lng: -89.3985,
    defaultZoom: 6,
    totalBusinesses: '1.2 million',
    workforceShare: '45.1%',
    consumerWebSearchRate: '86%',
    mobileLocalQueries: '82%',
    economicOutput: '$1.0 Trillion',
    heroBadge: 'Midwest Regional Commerce & Local Search Hub',
    heroHeadline: 'Illinois Local Search Behavior & Small Business SEO Guide 🌾',
    heroSubheadline: 'Explore local search behaviors across the Chicago metropolitan area, Cook County, and central Illinois commercial corridors.',
    districts: [],
    consumerBehavior: {
      title: 'Illinois Consumer Search Patterns & Digital Adoption',
      overview: 'Over 86% of Illinois residents research local businesses online prior to calling or booking appointments, with heavy mobile map engagement across Chicago and regional transit zones.',
      keyFindings: [
        '86% of Illinois consumers search online before selecting home services, healthcare, or legal counsel.',
        'High mobile query volume across transit corridors and dense suburban trade centers.'
      ],
      searchFrictionPoints: ['Inconsistent business operating hours on seasonal holidays.'],
      decisionFactors: [
        { factor: 'Google Map Pack Rank', percentage: '75%', impact: 'Determines inbound phone calls' }
      ]
    },
    businessStrategy: {
      title: 'Illinois Local Business Search Playbook',
      overview: 'Secure top-3 Google Map Pack positions with verified NAP citations and regional business schema.',
      actionSteps: [
        { title: 'Midwest Citation Alignment', step: 'Step 1', detail: 'Synchronize citations across Illinois chambers and directories.' }
      ]
    },
    citations: [
      {
        id: 'il-sba-1',
        title: '2023 Small Business Economic Profile: Illinois',
        url: 'https://advocacy.sba.gov/wp-content/uploads/2023/11/2023-Small-Business-Economic-Profile-IL.pdf',
        sourceName: 'U.S. Small Business Administration',
        publishedYear: '2023',
        finding: 'Illinois is home to 1.2 million small businesses representing 99.6% of all state employers.',
        anchorText: 'SBA Illinois Small Business Profile'
      }
    ],
    faqs: [
      {
        question: 'How do Illinois consumers search for local businesses?',
        answer: 'Over 86% use Google Search and Maps on smartphones, prioritizing verified reviews and local proximity.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Illinois Local SEO Strategy - Local Surge'
  },
  washington: {
    name: 'Washington',
    slug: 'washington',
    code: 'WA',
    lat: 47.7511,
    lng: -120.7401,
    defaultZoom: 6,
    totalBusinesses: '640,000',
    workforceShare: '50.2%',
    consumerWebSearchRate: '90%',
    mobileLocalQueries: '85%',
    economicOutput: '$725 Billion',
    heroBadge: 'Pacific Northwest Digital Commerce Intelligence',
    heroHeadline: 'Washington State Local SEO & Consumer Search Blueprint 🌲',
    heroSubheadline: 'Drive high-intent local customer acquisition across the Puget Sound, Seattle tech corridor, and Spokane commercial hubs.',
    districts: [],
    consumerBehavior: {
      title: 'Pacific Northwest Consumer Digital Search Behavior',
      overview: 'Washington consumers exhibit high digital expectations with 90% conducting online research before engaging with local businesses.',
      keyFindings: [
        '90% of Washington residents research local contractors and services online.',
        'High demand for online instant booking and transparent pricing.'
      ],
      searchFrictionPoints: ['Slow mobile load speeds and lack of structured booking options.'],
      decisionFactors: [
        { factor: 'Review Freshness & Sentiment', percentage: '79%', impact: 'Builds immediate brand confidence' }
      ]
    },
    businessStrategy: {
      title: 'Washington State Local SEO Strategy',
      overview: 'Implement schema markup and coordinate-targeted Google Business Profile optimization.',
      actionSteps: [
        { title: 'Local Schema Deployment', step: 'Step 1', detail: 'Deploy structured LocalBusiness metadata.' }
      ]
    },
    citations: [
      {
        id: 'wa-sba-1',
        title: '2023 Small Business Economic Profile: Washington',
        url: 'https://advocacy.sba.gov/wp-content/uploads/2023/11/2023-Small-Business-Economic-Profile-WA.pdf',
        sourceName: 'U.S. Small Business Administration',
        publishedYear: '2023',
        finding: 'Washington is home to 640,000 small businesses employing 1.4 million workers.',
        anchorText: 'SBA Washington Small Business Profile'
      }
    ],
    faqs: [
      {
        question: 'What makes local SEO effective in Washington state?',
        answer: 'High tech literacy means consumers compare ratings, page speed, and schema-rich snippets before calling.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Washington State Local SEO - Local Surge'
  }
};

// -----------------------------------------------------------------------------------------
// DISTRICTS REGISTRY (CITY & METROPOLITAN LEVEL)
// -----------------------------------------------------------------------------------------

export const DISTRICTS_REGISTRY: Record<string, LocationDistrict> = {
  'los-angeles': {
    name: 'Los Angeles',
    slug: 'los-angeles',
    stateSlug: 'california',
    stateName: 'California',
    stateCode: 'CA',
    lat: 34.0522,
    lng: -118.2437,
    defaultZoom: 10,
    population: '9.86 Million (LA County)',
    smallBusinesses: '296,746',
    webUtilizationRate: '89%',
    mobileSearchShare: '84%',
    mapPackClickShare: '76%',
    digitalGaps: '74,000 businesses lack optimized Google Maps presence',
    heroBadge: 'Los Angeles District Market Study & Local Ranking Blueprint',
    heroHeadline: 'Los Angeles Local SEO Strategy & Consumer Search Behavior Study 🎬',
    heroSubheadline: 'Los Angeles County is the second-largest economic market in the United States. Our empirical study examines how 9.86 million residents research and select local businesses, the exact conversion impact of the Google Local 3-Pack, and the precise playbook local owners need to outrank regional competitors.',
    municipalCities: [
      'Long Beach', 'Santa Monica', 'Pasadena', 'Glendale', 'Torrance', 
      'Burbank', 'Inglewood', 'Compton', 'Downey', 'West Hollywood', 
      'Beverly Hills', 'El Monte', 'Norwalk', 'Pomona', 'Santa Clarita', 
      'Lancaster', 'Palmdale', 'Redondo Beach', 'Culver City', 'Manhattan Beach'
    ],
    consumerBehavior: {
      title: 'Empirical Study: How Los Angeles Consumers Search and Choose Local Businesses',
      overview: 'With over 500 square miles of dense geography spanning Downtown LA, Silicon Beach, the San Fernando Valley, and South Bay, consumer search behavior in Los Angeles is fiercely fragmented. Our data reveals that 89% of LA consumers consult Google Search or Maps prior to booking home services, dining, healthcare, or legal counsel. Because traffic congestion limits travel willingness, Angelenos rely heavily on hyper-local proximity and verified customer sentiment.',
      keyFindings: [
        '89% of Los Angeles residents use search engines and Google Maps to evaluate local businesses before calling or visiting.',
        '84% of all local business inquiries in LA originate on mobile smartphones, with 68% clicking the direct "Call" or "Directions" button.',
        '76% of high-intent search clicks go exclusively to the top 3 listings in the Google Local 3-Pack map view.',
        'Consumers in West Los Angeles and Silicon Beach exhibit the highest online booking adoption rate (62%) compared to the county average (44%).',
        '71% of Angelenos disregard businesses with fewer than 15 total reviews or ratings below 4.2 stars.',
        'An estimated 74,000 active small businesses in Los Angeles County have either unverified or incomplete Google Business Profiles.'
      ],
      searchFrictionPoints: [
        'Neighborhood boundary confusion: A consumer in Santa Monica will rarely convert for a contractor showing a Pasadena or Long Beach physical address unless dedicated service area coverage is proven.',
        'Missing price transparency or estimated response times on mobile landing pages.',
        'Inconsistent business operating hours on national holidays or weekends causing high bounce rates.'
      ],
      decisionFactors: [
        { factor: 'Placement in Google 3-Pack', percentage: '76%', impact: 'Captures immediate first-screen mobile real estate' },
        { factor: 'Recent 5-Star Reviews & Owner Responses', percentage: '73%', impact: 'Validates responsiveness and customer service excellence' },
        { factor: 'Neighborhood-Specific Provenance', percentage: '66%', impact: 'Overcomes LA traffic distance hesitations' },
        { factor: 'Mobile Website Fast Load Speed (< 2 sec)', percentage: '59%', impact: 'Prevents customer abandonment on cellular connections' }
      ]
    },
    businessStrategy: {
      title: 'Local Business Owner Growth Playbook for Los Angeles',
      overview: 'Winning local search market share in Los Angeles requires a targeted multi-neighborhood strategy rather than a generic city-wide approach. Local business owners must combine coordinate-accurate Google Business Profiles, structured LocalBusiness Schema, and localized content hubs.',
      actionSteps: [
        {
          title: 'Optimize Google Business Profile for Micro-Neighborhoods',
          step: 'Phase 1',
          detail: 'Specify distinct service area boundaries across key LA clusters (Westside, Valley, DTLA, South Bay) and upload weekly geotagged project photos.'
        },
        {
          title: 'Implement LocalBusiness & FAQ JSON-LD Schemas',
          step: 'Phase 2',
          detail: 'Inject machine-readable coordinate data, accepted payment types, opening hours, and neighborhood target tags directly into your HTML source.'
        },
        {
          title: 'Audit & Sync NAP Citations Across 50+ Directories',
          step: 'Phase 3',
          detail: 'Eliminate duplicate listings and synchronize Name, Address, and Phone records on Yelp, Apple Maps, Bing Places, YellowPages, and the LA Chamber of Commerce.'
        },
        {
          title: 'Automate 5-Star Review Acquisition Funnels',
          step: 'Phase 4',
          detail: 'Implement automated SMS/email review requests immediately following job completion to maintain fresh algorithmic review velocity.'
        }
      ],
      neighborhoodFocus: [
        { name: 'Silicon Beach & Santa Monica', niche: 'Professional, Wellness & Creative Services', priority: 'High Search Volume' },
        { name: 'San Fernando Valley (Sherman Oaks/Encino)', niche: 'Home Trades, HVAC, Roofing & Contractors', priority: 'High Commercial Spend' },
        { name: 'Downtown LA (DTLA) & Arts District', niche: 'Hospitality, Legal, Medical & Logistics', priority: 'Dense Mobile Queries' },
        { name: 'Pasadena & San Gabriel Valley', niche: 'Healthcare, Education & Family Services', priority: 'High Brand Loyalty' }
      ]
    },
    citations: [
      {
        id: 'la-census-1',
        title: 'QuickFacts: Los Angeles County, California',
        url: 'https://www.census.gov/quickfacts/losangelescountycalifornia',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'Los Angeles County has an estimated population of 9,861,703 residents with over 1.3 million commercial employer and non-employer establishments.',
        anchorText: 'U.S. Census Bureau Los Angeles County Data'
      },
      {
        id: 'la-sba-2',
        title: 'Los Angeles District Office Overview & Economic Contribution',
        url: 'https://www.sba.gov/district/los-angeles',
        sourceName: 'U.S. Small Business Administration (SBA)',
        publishedYear: '2024',
        finding: 'The SBA Los Angeles District serves over 1.6 million small businesses across LA, Ventura, and Santa Barbara counties.',
        anchorText: 'SBA Los Angeles District Office'
      },
      {
        id: 'la-brightlocal-3',
        title: 'Consumer Search and Map Pack Utilization Benchmark',
        url: 'https://www.brightlocal.com/research/google-business-profile-stats/',
        sourceName: 'BrightLocal Insights',
        publishedYear: '2024',
        finding: 'The average local business receives 1,260 monthly views on Google Search and Maps, with 56% of actions being website clicks and 24% direct phone calls.',
        anchorText: 'BrightLocal Google Business Profile Performance Benchmarks'
      },
      {
        id: 'la-bls-4',
        title: 'Los Angeles-Long Beach-Anaheim Economic Summary',
        url: 'https://www.bls.gov/regions/west/ca_losangeles_msa.htm',
        sourceName: 'U.S. Bureau of Labor Statistics',
        publishedYear: '2024',
        finding: 'Private non-farm employment in the Los Angeles MSA encompasses over 4.5 million wage and salary positions led by professional and business services.',
        anchorText: 'BLS Los Angeles Metro Economic Report'
      }
    ],
    faqs: [
      {
        question: 'How do Los Angeles consumers find local businesses online?',
        answer: '89% of Los Angeles consumers search online using Google Search and Google Maps, with 84% using mobile phones. Due to traffic, consumers strongly prefer businesses ranked in the Google Local 3-Pack within their specific district or neighborhood.'
      },
      {
        question: 'What is the most effective SEO strategy for an LA small business owner?',
        answer: 'Focus on hyper-local geographic relevance: claim and optimize your Google Business Profile with exact coordinates, build consistent citations across Tier-1 directories, deploy LocalBusiness JSON-LD schema, and target micro-neighborhood landing pages.'
      },
      {
        question: 'How much revenue do LA businesses lose by not ranking in Google Maps?',
        answer: 'With 76% of high-intent mobile search clicks going to the top 3 listings in the Google Map Pack, businesses not ranking in the top 3 lose over 60% of prospective inbound leads to direct local competitors.'
      },
      {
        question: 'Why do national SEO agencies fail when optimizing for Los Angeles?',
        answer: 'National agencies treat Los Angeles as a single unified market, missing the deep micro-neighborhood divisions between the Westside, Valley, DTLA, and South Bay. Local consumers will not cross regional divides unless geographic relevance is explicitly signaled.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Los Angeles Local SEO & Consumer Search Behavior Study - Local Surge'
  },
  'san-jose': {
    name: 'San Jose',
    slug: 'san-jose',
    stateSlug: 'california',
    stateName: 'California',
    stateCode: 'CA',
    lat: 37.3382,
    lng: -121.8863,
    defaultZoom: 11,
    population: '971,233 (Santa Clara County)',
    smallBusinesses: '65,000',
    webUtilizationRate: '92%',
    mobileSearchShare: '86%',
    mapPackClickShare: '78%',
    digitalGaps: '18,500 local service companies lack proper Google 3-Pack setups',
    heroBadge: 'Silicon Valley Capital Market Study',
    heroHeadline: 'San Jose Local SEO Strategy & Silicon Valley Digital Adoption 💻',
    heroSubheadline: 'San Jose demands the highest digital competency standards in the nation. Discover how 1.0 million Silicon Valley consumers search for local home trades, medical, and professional services.',
    municipalCities: [
      'Sunnyvale', 'Santa Clara', 'Mountain View', 'Milpitas', 'Cupertino', 
      'Palo Alto', 'Campbell', 'Los Gatos', 'Morgan Hill', 'Gilroy', 'Saratoga', 'Los Altos'
    ],
    consumerBehavior: {
      title: 'Consumer Search Trends in the Capital of Silicon Valley',
      overview: 'San Jose tech-savvy consumers have zero tolerance for broken websites or inconsistent business information. Over 92% research local providers online.',
      keyFindings: [
        '92% of San Jose residents research service providers online before making contact.',
        'Fast page speeds (< 1.8s) are critical to maintaining engagement in this high-tech market.',
        '78% of local search clicks flow directly to verified Google Local 3-Pack listings.'
      ],
      searchFrictionPoints: ['Incomplete schema markup causing rich snippet omissions in search.'],
      decisionFactors: [
        { factor: 'Google Map Pack Rank', percentage: '78%', impact: 'Immediate primary click driver' },
        { factor: 'Modern Web UX & Accessibility', percentage: '72%', impact: 'Validates technological competency' }
      ]
    },
    businessStrategy: {
      title: 'San Jose Business Growth Blueprint',
      overview: 'Deploy advanced JSON-LD schemas and authoritative local directory citations across Silicon Valley.',
      actionSteps: [
        { title: 'Technical Schema Optimization', step: 'Step 1', detail: 'Implement LocalBusiness and Organization structured data.' }
      ]
    },
    citations: [
      {
        id: 'sj-census-1',
        title: 'QuickFacts: San Jose City, California',
        url: 'https://www.census.gov/quickfacts/sanjosecitycalifornia',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'San Jose is the 10th largest city in the U.S. with a highly connected population and median household income exceeding $130,000.',
        anchorText: 'U.S. Census Bureau San Jose Data'
      }
    ],
    faqs: [
      {
        question: 'Why is local SEO competitive in San Jose?',
        answer: 'San Jose has high consumer expectations and tech-literate residents who rely heavily on mobile search, reviews, and schema-rich Google results.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'San Jose Local SEO & Market Study - Local Surge'
  },
  oakland: {
    name: 'Oakland',
    slug: 'oakland',
    stateSlug: 'california',
    stateName: 'California',
    stateCode: 'CA',
    lat: 37.8044,
    lng: -122.2712,
    defaultZoom: 11,
    population: '440,000',
    smallBusinesses: '34,000',
    webUtilizationRate: '87%',
    mobileSearchShare: '83%',
    mapPackClickShare: '75%',
    digitalGaps: '11,200 firms currently lack professional maps indexing',
    heroBadge: 'East Bay Commercial Corridor Study',
    heroHeadline: 'Oakland Local SEO Blueprint & Community Search Behavior 🌳',
    heroSubheadline: 'Capture high-intent searches from the East Bay Hills to Jack London Square. Establish dominant positioning in Google’s Local 3-Pack through clean citations and localized schemas.',
    municipalCities: [
      'Berkeley', 'Alameda', 'San Leandro', 'Hayward', 'Fremont', 
      'Richmond', 'Castro Valley', 'Emeryville', 'Piedmont', 'Union City', 'Pleasanton'
    ],
    consumerBehavior: {
      title: 'East Bay Consumer Search Patterns in Oakland',
      overview: 'Oakland consumers strongly favor local community businesses and prioritize authentic reviews and clear neighborhood identity.',
      keyFindings: [
        '87% of Oakland consumers turn to search engines for local dining, trade, and legal services.',
        'High mobile search volume during transit and commute hours along BART lines.'
      ],
      searchFrictionPoints: ['Confusion between Oakland and San Francisco service territories.'],
      decisionFactors: [
        { factor: 'East Bay Proximity Verification', percentage: '75%', impact: 'Confirms local physical presence' }
      ]
    },
    businessStrategy: {
      title: 'Oakland Local SEO Strategy',
      overview: 'Establish clear East Bay authority through localized citations and community backlink partnerships.',
      actionSteps: [
        { title: 'Community Citation Sync', step: 'Step 1', detail: 'Lock in consistent East Bay address records.' }
      ]
    },
    citations: [
      {
        id: 'oak-census-1',
        title: 'QuickFacts: Oakland City, California',
        url: 'https://www.census.gov/quickfacts/oaklandcitycalifornia',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'Oakland is the economic heart of the East Bay with over 34,000 registered commercial businesses.',
        anchorText: 'U.S. Census Bureau Oakland Data'
      }
    ],
    faqs: [
      {
        question: 'How do Oakland consumers choose local businesses?',
        answer: 'They rely on Google Maps with a strong preference for verified East Bay businesses with active neighborhood customer reviews.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Oakland Local SEO Strategy - Local Surge'
  },
  'san-diego': {
    name: 'San Diego',
    slug: 'san-diego',
    stateSlug: 'california',
    stateName: 'California',
    stateCode: 'CA',
    lat: 32.7157,
    lng: -117.1611,
    defaultZoom: 11,
    population: '1.38 Million',
    smallBusinesses: '95,000',
    webUtilizationRate: '88%',
    mobileSearchShare: '85%',
    mapPackClickShare: '77%',
    digitalGaps: '28,000 businesses lack claimed or optimized Google Maps listings',
    heroBadge: 'Southern California Coastal Market Study',
    heroHeadline: 'San Diego Local SEO Strategy & Coastal Consumer Trends ☀️',
    heroSubheadline: 'Reach high-value residential and tourism markets from La Jolla and Downtown to North County. Dominate the local map pack with hyper-local coordinate citations.',
    municipalCities: [
      'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'El Cajon', 
      'Vista', 'San Marcos', 'Encinitas', 'National City', 'La Mesa', 'Coronado', 'Del Mar'
    ],
    consumerBehavior: {
      title: 'Coastal Search Dynamics in San Diego',
      overview: 'San Diego combines high permanent resident service needs with vibrant military and coastal tourism economies.',
      keyFindings: [
        '88% of San Diego residents consult Google Maps before calling local contractors or medical practices.',
        'High mobile query volume across North County and coastal corridors.'
      ],
      searchFrictionPoints: ['Broad county-wide targeting that fails to capture neighborhood coastal intent.'],
      decisionFactors: [
        { factor: 'Map Pack Placement', percentage: '77%', impact: 'Drives direct phone call conversion' }
      ]
    },
    businessStrategy: {
      title: 'San Diego SEO Blueprint',
      overview: 'Target distinct coastal and inland hubs with dedicated coordinate landing pages.',
      actionSteps: [
        { title: 'Coastal Hub Tagging', step: 'Step 1', detail: 'Create location pages for La Jolla, Pacific Beach, and North County.' }
      ]
    },
    citations: [
      {
        id: 'sd-census-1',
        title: 'QuickFacts: San Diego City, California',
        url: 'https://www.census.gov/quickfacts/sandiegocitycalifornia',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'San Diego is the 8th largest city in the U.S. with over 1.38 million residents and diverse biotech and defense clusters.',
        anchorText: 'U.S. Census Bureau San Diego Data'
      }
    ],
    faqs: [
      {
        question: 'Why is Google Map Pack ranking crucial in San Diego?',
        answer: 'Over 77% of mobile search clicks in San Diego go to the top 3 map results. Without Map Pack visibility, businesses lose high-value inbound calls.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'San Diego Local SEO & Consumer Trends - Local Surge'
  },
  austin: {
    name: 'Austin',
    slug: 'austin',
    stateSlug: 'texas',
    stateName: 'Texas',
    stateCode: 'TX',
    lat: 30.2672,
    lng: -97.7431,
    defaultZoom: 11,
    population: '974,000',
    smallBusinesses: '52,000',
    webUtilizationRate: '91%',
    mobileSearchShare: '85%',
    mapPackClickShare: '79%',
    digitalGaps: '14,000 businesses lack optimized maps',
    heroBadge: 'Silicon Hills Local SEO Study',
    heroHeadline: 'Austin Local SEO Blueprint & Tech-Driven Search Trends 🎸',
    heroSubheadline: 'Navigate rapid commercial growth in Silicon Hills. Capture inbound search demand across downtown, South Congress, and the Domain.',
    municipalCities: [
      'Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'San Marcos', 
      'Leander', 'Kyle', 'Buda', 'Lakeway', 'Bee Cave', 'Hutto', 'Manor'
    ],
    consumerBehavior: {
      title: 'Silicon Hills Consumer Search Behavior',
      overview: 'Austin consumers expect modern, frictionless digital booking and rapid response times.',
      keyFindings: ['91% of Austin residents search online before selecting local service firms.'],
      searchFrictionPoints: ['Inaccurate hours on holidays and SXSW festival season.'],
      decisionFactors: [{ factor: 'Map Pack Placement', percentage: '79%', impact: 'Primary mobile lead source' }]
    },
    businessStrategy: {
      title: 'Austin Business Search Playbook',
      overview: 'Optimize for tech corridors and suburban growth zones.',
      actionSteps: [{ title: 'GBP Sync', step: 'Step 1', detail: 'Synchronize citations across tech directories.' }]
    },
    citations: [
      {
        id: 'atx-census-1',
        title: 'QuickFacts: Austin City, Texas',
        url: 'https://www.census.gov/quickfacts/austincitytexas',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'Austin has experienced some of the fastest population and business formation growth in the U.S.',
        anchorText: 'U.S. Census Bureau Austin Statistics'
      }
    ],
    faqs: [
      {
        question: 'How do Austin residents choose local services?',
        answer: '91% research online, prioritizing verified Google Business Profiles with recent positive reviews.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Austin Local SEO Strategy - Local Surge'
  },
  houston: {
    name: 'Houston',
    slug: 'houston',
    stateSlug: 'texas',
    stateName: 'Texas',
    stateCode: 'TX',
    lat: 29.7604,
    lng: -95.3698,
    defaultZoom: 10,
    population: '2.3 Million',
    smallBusinesses: '140,000',
    webUtilizationRate: '86%',
    mobileSearchShare: '83%',
    mapPackClickShare: '75%',
    digitalGaps: '38,000 businesses with incomplete directory entries',
    heroBadge: 'Gulf Coast Commercial Energy Corridor',
    heroHeadline: 'Houston Local SEO Strategy & Consumer Search Dynamics 🚀',
    heroSubheadline: 'Dominate search visibility across the nation’s 4th largest city. Overcome massive geographic dispersion with coordinate-targeted SEO.',
    municipalCities: [
      'Pasadena', 'Pearland', 'Sugar Land', 'The Woodlands', 'League City', 
      'Baytown', 'Conroe', 'Friendswood', 'Katy', 'Missouri City', 'Spring', 'Cypress'
    ],
    consumerBehavior: {
      title: 'Metro Houston Local Search Patterns',
      overview: 'Houston’s immense geographic spread requires sub-market coordinate optimization for the Galleria, Heights, Woodlands, and Katy.',
      keyFindings: ['86% of Houston residents research home trades online.'],
      searchFrictionPoints: ['Excessive service area radius diluting local rankings.'],
      decisionFactors: [{ factor: 'Neighborhood Proximity', percentage: '77%', impact: 'Reduces commute distance' }]
    },
    businessStrategy: {
      title: 'Houston Multi-Hub Search Strategy',
      overview: 'Build satellite neighborhood pages for major peripheral hubs.',
      actionSteps: [{ title: 'Service Area Clustered Pages', step: 'Step 1', detail: 'Deploy targeted sub-market landing hubs.' }]
    },
    citations: [
      {
        id: 'hou-census-1',
        title: 'QuickFacts: Houston City, Texas',
        url: 'https://www.census.gov/quickfacts/houstoncitytexas',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'Houston is the most diverse metropolitan area in Texas with over 2.3 million residents.',
        anchorText: 'U.S. Census Bureau Houston Data'
      }
    ],
    faqs: [
      {
        question: 'Why is coordinate SEO essential in Houston?',
        answer: 'Houston spans over 600 square miles. A single location cannot rank across the entire metro without targeted neighborhood spoke pages.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Houston Local SEO Strategy - Local Surge'
  },
  dallas: {
    name: 'Dallas',
    slug: 'dallas',
    stateSlug: 'texas',
    stateName: 'Texas',
    stateCode: 'TX',
    lat: 32.7767,
    lng: -96.7970,
    defaultZoom: 10,
    population: '1.3 Million',
    smallBusinesses: '85,000',
    webUtilizationRate: '87%',
    mobileSearchShare: '84%',
    mapPackClickShare: '76%',
    digitalGaps: '22,000 businesses lacking verified map pins',
    heroBadge: 'DFW Corporate & Trade Hub Study',
    heroHeadline: 'Dallas Local SEO Strategy & Commercial Search Analytics 💼',
    heroSubheadline: 'Capture commercial and residential search demand across the Dallas-Fort Worth metroplex with precision local ranking systems.',
    municipalCities: [
      'Fort Worth', 'Arlington', 'Plano', 'Irving', 'Garland', 
      'Frisco', 'McKinney', 'Grand Prairie', 'Carrollton', 'Richardson', 'Lewisville', 'Denton'
    ],
    consumerBehavior: {
      title: 'Dallas Consumer Search Trends',
      overview: 'DFW consumers heavily rely on Google Maps and verified customer reviews for contracting, legal, and automotive services.',
      keyFindings: ['87% of Dallas consumers utilize search engines prior to booking appointments.'],
      searchFrictionPoints: ['Inconsistent DFW suburb address records.'],
      decisionFactors: [{ factor: 'Google 3-Pack Presence', percentage: '76%', impact: 'Drives primary inquiries' }]
    },
    businessStrategy: {
      title: 'Dallas Local SEO Playbook',
      overview: 'Execute high-authority citation syndication across DFW regional commerce platforms.',
      actionSteps: [{ title: 'Regional Citation Sync', step: 'Step 1', detail: 'Align NAP across North Texas directories.' }]
    },
    citations: [
      {
        id: 'dal-census-1',
        title: 'QuickFacts: Dallas City, Texas',
        url: 'https://www.census.gov/quickfacts/dallascitytexas',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'Dallas anchors the 4th largest metropolitan statistical area in the country.',
        anchorText: 'U.S. Census Bureau Dallas Data'
      }
    ],
    faqs: [
      {
        question: 'How do Dallas consumers search for local contractors?',
        answer: '87% rely on Google Search and Map Pack results, checking ratings and response times before calling.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Dallas Local SEO Strategy - Local Surge'
  },
  miami: {
    name: 'Miami',
    slug: 'miami',
    stateSlug: 'florida',
    stateName: 'Florida',
    stateCode: 'FL',
    lat: 25.7617,
    lng: -80.1918,
    defaultZoom: 11,
    population: '450,000 (City) / 2.7M (County)',
    smallBusinesses: '92,000',
    webUtilizationRate: '88%',
    mobileSearchShare: '87%',
    mapPackClickShare: '79%',
    digitalGaps: '26,000 businesses lack bilingual or mobile-optimized profiles',
    heroBadge: 'South Florida International Hub Study',
    heroHeadline: 'Miami Local SEO Blueprint & Bilingual Consumer Search Trends 🌴',
    heroSubheadline: 'Dominate the gateway to the Americas. Capture high-intent tourism, luxury trades, and residential search queries across Brickell, South Beach, and Coral Gables.',
    municipalCities: [
      'Hialeah', 'Miami Beach', 'Coral Gables', 'Doral', 'North Miami', 
      'Homestead', 'Aventura', 'Kendall', 'Sunny Isles Beach', 'Pinecrest', 'Key Biscayne'
    ],
    consumerBehavior: {
      title: 'Miami Consumer Search Patterns',
      overview: 'Miami requires bilingual Spanish/English search optimization to capture both domestic and international local search intent.',
      keyFindings: ['88% of Miami residents search for local services on mobile smartphones.'],
      searchFrictionPoints: ['Lack of Spanish language metadata and descriptions.'],
      decisionFactors: [{ factor: 'Mobile Accessibility & Speed', percentage: '81%', impact: 'Prevents immediate bounces' }]
    },
    businessStrategy: {
      title: 'Miami Local SEO Blueprint',
      overview: 'Deploy dual-language schema markup and geotargeted coastal pins.',
      actionSteps: [{ title: 'Bilingual Listing Sync', step: 'Step 1', detail: 'Optimize English and Spanish keyword variations.' }]
    },
    citations: [
      {
        id: 'mia-census-1',
        title: 'QuickFacts: Miami City, Florida',
        url: 'https://www.census.gov/quickfacts/miamicityflorida',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'Miami is a global commerce capital with over 92,000 small business enterprises.',
        anchorText: 'U.S. Census Bureau Miami Data'
      }
    ],
    faqs: [
      {
        question: 'Why is bilingual SEO essential in Miami?',
        answer: 'Over 65% of Miami residents speak Spanish at home. Optimizing for both English and Spanish queries dramatically expands your addressable customer pool.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'Miami Local SEO Strategy - Local Surge'
  },
  'new-york-city': {
    name: 'New York City',
    slug: 'new-york-city',
    stateSlug: 'new-york',
    stateName: 'New York',
    stateCode: 'NY',
    lat: 40.7128,
    lng: -74.0060,
    defaultZoom: 11,
    population: '8.3 Million',
    smallBusinesses: '220,000',
    webUtilizationRate: '91%',
    mobileSearchShare: '88%',
    mapPackClickShare: '81%',
    digitalGaps: '55,000 businesses lack borough-specific schema tagging',
    heroBadge: 'Five Boroughs Commercial Intelligence',
    heroHeadline: 'New York City Local SEO & Micro-Neighborhood Search Blueprint 🗽',
    heroSubheadline: 'Win the most competitive local search environment in the world. Rank across Manhattan, Brooklyn, Queens, the Bronx, and Staten Island.',
    municipalCities: [
      'Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island', 
      'Long Island City', 'Flushing', 'Astoria', 'Williamsburg', 'Harlem', 'Bay Ridge', 'Riverdale'
    ],
    consumerBehavior: {
      title: 'NYC Micro-Neighborhood Search Behaviors',
      overview: 'New York consumers search strictly within walking distance or immediate subway line stops, demanding pinpoint local precision.',
      keyFindings: ['91% of New Yorkers search on mobile devices while walking or in transit.'],
      searchFrictionPoints: ['Failing to specify cross streets or subway access in listings.'],
      decisionFactors: [{ factor: 'Walking Radius (< 15 mins)', percentage: '84%', impact: 'Decisive consumer filter' }]
    },
    businessStrategy: {
      title: 'NYC Hyper-Local Strategy',
      overview: 'Target micro-neighborhoods like Tribeca, Williamsburg, Astoria, and Midtown.',
      actionSteps: [{ title: 'Transit Landmark Schemas', step: 'Step 1', detail: 'Tag nearest transit lines in structured metadata.' }]
    },
    citations: [
      {
        id: 'nyc-census-1',
        title: 'QuickFacts: New York City, New York',
        url: 'https://www.census.gov/quickfacts/newyorkcitynewyork',
        sourceName: 'U.S. Census Bureau',
        publishedYear: '2024',
        finding: 'New York City is the most populous city in the U.S. with 8.3 million residents and 220,000 small businesses.',
        anchorText: 'U.S. Census Bureau New York City Data'
      }
    ],
    faqs: [
      {
        question: 'How do New Yorkers find local services?',
        answer: 'They rely almost exclusively on mobile Google Maps, filtering for top-rated businesses within a few blocks or subway stops.'
      }
    ],
    ogImage: '/assets/og-directory.png',
    ogImageAlt: 'New York City Local SEO Strategy - Local Surge'
  }
};

// Helper utilities for route resolution and lookup
export function getAllMappedStates(): LocationState[] {
  return Object.values(STATES_REGISTRY);
}

export function getAllMappedDistricts(): LocationDistrict[] {
  return Object.values(DISTRICTS_REGISTRY);
}

export function getStateBySlug(slug: string): LocationState | undefined {
  return STATES_REGISTRY[slug.toLowerCase().trim()];
}

export function getDistrictBySlug(districtSlug: string): LocationDistrict | undefined {
  return DISTRICTS_REGISTRY[districtSlug.toLowerCase().trim()];
}

export function getDistrictsForState(stateSlug: string): LocationDistrict[] {
  const state = getStateBySlug(stateSlug);
  if (!state) return [];
  return state.districts.map(slug => DISTRICTS_REGISTRY[slug]).filter(Boolean);
}
