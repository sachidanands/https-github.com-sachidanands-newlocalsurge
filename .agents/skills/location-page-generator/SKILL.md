---
name: location-page-generator
description: Generate new research-backed state and district local SEO location pages with interactive map pins, empirical consumer behavior studies, authoritative outbound backlink citations, and server-side HTML prerendering. Use when user says "add a location page", "add district", "generate state page", "add city study", "new location study", or wants to expand the locations map directory.
user-invocable: true
metadata:
  version: "1.0.0"
  category: "seo"
---

# Location Page Generator Skill

You are an expert local SEO analyst, econometric market researcher, and full-stack software engineer. Your objective is to expand Local Surge SEO's interactive US Locations directory by generating comprehensive, empirical local market studies for states and metropolitan districts.

Every location page created must satisfy five non-negotiable standards:
1. **Interactive Map Representation**: Accurate GPS coordinates (`lat`, `lng`) and zoom level clamping (max zoom 11, district level). The map pin appears automatically once added to data.
2. **Empirical Consumer Search Behavior Research**: Quantitative metrics on local consumer web utilization, smartphone query percentages, and Google Map Pack conversion impact.
3. **Actionable Local Business Owner Blueprint**: Step-by-step guidance on how local firms in that district/state can outrank competitors in the Google Local 3-Pack.
4. **Authoritative Primary Source Citations & Backlinks**: Clear outbound citations and anchor text links to verified institutions (U.S. Small Business Administration, U.S. Census Bureau, Bureau of Labor Statistics, BrightLocal).
5. **Full SEO & "View Page Source" Crawlability**: Full semantic HTML (`<nav>`, `<h1>`, content, citation backlinks, internal links) and JSON-LD structured data (`BreadcrumbList`, `FAQPage`, `LocalBusiness`) prerendered into the initial HTTP response.
6. **ADA / WCAG 2.1 AA Compliance**: Proper contrast ratios, accessible button and navigation labels, visible focus indicators, and screen reader alternative directories.

---

## Generation Workflow

### Step 1: Geographic Identification & Coordinate Mapping
When given a target location (e.g., "Chicago, Illinois" or "Washington State"):
1. Identify whether it is a **State** (`/locations/:state/`) or a **District/Metropolitan Area** (`/locations/:state/:district`).
2. Determine exact centroid geographic coordinates:
   - Latitude and Longitude to 4 decimal places.
   - For States: default zoom 6.
   - For Districts: default zoom 10 or 11 (clamped to max zoom 11 so street-level zooming is blocked).
3. Identify state slug, state name, state postal code, district slug, and official municipality/county name.

---

### Step 2: Consumer Search Behavior & Economic Data Compilation
Compile verifiable empirical figures for the target location:
- **Total Small Businesses** (from SBA State Profile or County Business Patterns).
- **Consumer Web Utilization Rate** (% of local consumers who research online before visiting/calling).
- **Mobile Search Share** (% of local queries originating on smartphones).
- **Google Local 3-Pack Click Concentration** (% of clicks captured by top 3 map positions).
- **Estimated Digital Gap** (number of registered businesses lacking claimed or optimized Google Business Profiles).
- **Qualitative Consumer Search Trends**: Friction points (transit radius, neighborhood boundaries, lack of review velocity).

---

### Step 3: Source Verification & Backlink Citation Gathering
Gather 3 to 4 authoritative primary source citations:
- **U.S. Small Business Administration (SBA)**: State or regional economic profile (`https://www.sba.gov/` or `https://advocacy.sba.gov/`).
- **U.S. Census Bureau**: QuickFacts or County Business Patterns (`https://www.census.gov/quickfacts/`).
- **U.S. Bureau of Labor Statistics (BLS)**: Regional Economy at a Glance (`https://www.bls.gov/`).
- **BrightLocal / Local Search Industry Benchmarks**: Local Consumer Review Survey or GBP Insights (`https://www.brightlocal.com/research/`).

Each citation requires:
- `title`: Formal publication name
- `url`: Direct canonical URL
- `sourceName`: Publishing institution
- `publishedYear`: 2023 or 2024
- `finding`: Concrete quantitative statistic
- `anchorText`: Descriptive anchor text (e.g. `U.S. Census Bureau Chicago Statistics`)

---

### Step 4: Local Business Owner SEO Strategy Formulation
Draft 4 sequential phases tailored to that geography:
- **Phase 1: Google Business Profile Geographic Clustered Setup** (service area boundaries, coordinate pinning, geo-tagged project photos).
- **Phase 2: LocalBusiness & FAQ JSON-LD Schema Deployment** (machine-readable micro-data, opening hours, accepted currencies).
- **Phase 3: Tier-1 Citation & NAP Synchronization** (Apple Maps, Bing Places, YellowPages, Chamber of Commerce).
- **Phase 4: Automated 5-Star Review Acquisition Funnels** (SMS/email post-transaction prompts).

---

### Step 5: Ask a Question FAQ & Schema Construction
Write 3 to 4 localized Question and Answer pairs addressing:
1. How local consumers in that specific district discover service providers.
2. The most common SEO or Google Maps mistakes local owners make in that market.
3. Why national/generic SEO agencies fail in that specific municipal landscape.
4. Concrete steps to rank in the district Google Map Pack.

---

### Step 6: Registry Insertion in `src/data/locationsData.ts`
1. Open `src/data/locationsData.ts`.
2. If adding a **State**, add an entry to `STATES_REGISTRY`:
   ```ts
   'state-slug': {
     name: 'State Name',
     slug: 'state-slug',
     code: 'ST',
     lat: 00.0000,
     lng: -00.0000,
     defaultZoom: 6,
     totalBusinesses: '...',
     workforceShare: '...',
     consumerWebSearchRate: '...',
     mobileLocalQueries: '...',
     economicOutput: '...',
     heroBadge: '...',
     heroHeadline: '...',
     heroSubheadline: '...',
     districts: ['district-1-slug', ...],
     consumerBehavior: { ... },
     businessStrategy: { ... },
     citations: [ ... ],
     faqs: [ ... ],
     ogImage: '/assets/og-directory.png',
     ogImageAlt: '...'
   }
   ```
3. If adding a **District**, add an entry to `DISTRICTS_REGISTRY`:
   ```ts
   'district-slug': {
     name: 'District Name',
     slug: 'district-slug',
     stateSlug: 'state-slug',
     stateName: 'State Name',
     stateCode: 'ST',
     lat: 00.0000,
     lng: -00.0000,
     defaultZoom: 10,
     population: '...',
     smallBusinesses: '...',
     webUtilizationRate: '...',
     mobileSearchShare: '...',
     mapPackClickShare: '...',
     digitalGaps: '...',
     heroBadge: '...',
     heroHeadline: '...',
     heroSubheadline: '...',
     municipalCities: ['City 1', 'City 2', 'Suburban Hub 3', ...], // Non-clickable geographic coverage tags
     consumerBehavior: { ... },
     businessStrategy: { ... },
     citations: [ ... ],
     faqs: [ ... ],
     ogImage: '/assets/og-directory.png',
     ogImageAlt: '...'
   }
   ```
4. Ensure the parent state's `districts` array includes the new district slug.
5. Note on Map placement: The interactive map renders exclusively on `/locations` and state pages (`/locations/:state/`). District pages do not render a map and instead feature the non-clickable Municipal Cities & Communities perimeter list for high local relevance entity indexing.

---

### Step 7: Automated Verification & Smoke Testing
After saving the code, execute verification:
```bash
# 1. Typecheck
npm run lint

# 2. Verify server-side prerendered output via curl
curl -s http://localhost:3000/locations/[state-slug]/[district-slug] | grep -E "h1|census.gov|sba.gov"

# 3. Verify sitemap generation
curl -s http://localhost:3000/sitemap.xml | grep "/locations/[state-slug]/[district-slug]"
```

Checklist for final verification:
- [ ] Map pin displays with tooltip and navigates on click.
- [ ] Zoom level is clamped between level 3 and 11.
- [ ] BreadcrumbList schema and FAQPage schema are present.
- [ ] Outbound links to SBA, Census, or BLS open in a new tab with `target="_blank" rel="noopener noreferrer"`.
- [ ] Page is 100% accessible with keyboard navigation and meets WCAG 2.1 AA standards.
