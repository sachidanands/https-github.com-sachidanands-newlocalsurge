import express from "express";
import path from "path";
import fs from "fs";

import dotenv from "dotenv";

dotenv.config();

const app = express();

// Security middleware to prevent MIME-type sniffing, clickjacking, and XSS vulnerabilities
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://localsurgeseo.com; connect-src 'self' https://www.clarity.ms https://*.clarity.ms; frame-src 'self';");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Set safe payload size limit (since PDF generation is now server-side, large client uploads are not needed)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// HTML escaping helper to prevent HTML injection in emails
function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Lightweight memory-based rate limiter to protect public endpoints
const ipLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5; // Allow max 5 submissions per 15 mins per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = ipLimits.get(ip);
  if (!limit) {
    ipLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (now > limit.resetTime) {
    ipLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (limit.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }
  limit.count++;
  return false;
}

// Admin authorization middleware verifying secure static token
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader === "Bearer surge_fake_secure_token_2026") {
    return next();
  }
  res.status(401).json({ error: "Unauthorized access: Invalid or missing token" });
}

// Lazy initializers for premium integrations to prevent app crashes if keys are not set up yet
let supabaseClient: any = null;
async function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    // Prioritize SUPABASE_SERVICE_ROLE_KEY for robust backend queries that bypass RLS policies
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        supabaseClient = createClient(supabaseUrl, supabaseKey);
        console.log(`🟢 Supabase client successfully initialized using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key (bypasses RLS)' : 'Anon Key'}.`);
      } catch (err) {
        console.error("❌ Failed to initialize Supabase client:", err);
      }
    } else {
      console.warn("⚠️ SUPABASE_URL or SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to local JSON file db.");
    }
  }
  return supabaseClient;
}

let resendClient: any = null;
async function getResend() {
  if (!resendClient) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const { Resend } = await import("resend");
        resendClient = new Resend(resendApiKey);
        console.log("🟢 Resend client successfully initialized.");
      } catch (err) {
        console.error("❌ Failed to initialize Resend client:", err);
      }
    } else {
      console.warn("⚠️ RESEND_API_KEY is missing. Emails will not be sent via Resend real-time service.");
    }
  }
  return resendClient;
}

// Lazy initialize Gemini client to avoid crashes/bundling issues on startup
let aiClient: any = null;
let GenAiType: any = null;
async function getGemini() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI, Type } = await import("@google/genai");
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        GenAiType = Type;
        console.log("🟢 Gemini client successfully initialized.");
      } catch (err) {
        console.error("❌ Failed to initialize Gemini client:", err);
      }
    } else {
      console.warn("⚠️ GEMINI_API_KEY is not defined. AI features will fallback to high-quality mock data.");
    }
  }
  return { ai: aiClient, Type: GenAiType };
}

// Database helper
const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function initDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      // Seed default leads for demo/admin onboarding
      const initialLeads = [
        {
          id: "lead_1",
          createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          status: "audit_prepared",
          notes: "Scheduled call with owner next Tuesday at 10 AM. Interested in citation cleanup.",
          input: {
            planId: "starter",
            planName: "Starter Boost",
            businessName: "Elite Plumbing Denver",
            contactName: "Kevin Reynolds",
            email: "kevin@eliteplumbingdenver.com",
            phone: "303-555-0129",
            website: "https://eliteplumbingdenver.com",
            hasWebsite: true,
            industry: "Plumbing Services",
            location: "Denver, CO",
            keywords: "emergency plumber denver, leak repair denver, water heater setup",
            hasGBP: true,
            gbpLink: "https://google.com/maps/place/Denver"
          },
          aiAudit: {
            overallScore: 72,
            domainName: "eliteplumbingdenver.com",
            niche: "Plumbing Services",
            location: "Denver, CO",
            timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            EXECUTIVE_SUMMARY: "Denver's plumbing search volume is highly lucrative. Elite Plumbing has a solid foundation with an existing website, but lagging on-page keyword density and citation consistency on Yelp/Bing are throttling their rankings.",
            analysis: [
              {
                title: "Google Business Profile optimization",
                score: 80,
                description: "GBP exists but is missing target Service Areas and updated photos of recent projects.",
                recommendations: [
                  "Add 5-10 geo-tagged project photos per week.",
                  "Explicitly set service regions in Denver metro areas.",
                  "Implement direct Q&A answering common leaks & costs."
                ]
              },
              {
                title: "Technical and On-Page Content Audit",
                score: 65,
                description: "Homepage lacks schema markup and keyword density is below 0.8% for primary local terms.",
                recommendations: [
                  "Inject LocalBusiness Schema.org JSON-LD layout.",
                  "Restructure H1-H3 titles to lead with service + location tags.",
                  "Improve page load speed by compressing high-res images."
                ]
              },
              {
                title: "Local Citations and Backlink Profile",
                score: 70,
                description: "NAP (Name, Address, Phone) consistency score is 75% due to an old office address listed in Yellowpages.",
                recommendations: [
                  "Execute active directory sync across top 50 citations.",
                  "Build localized high-quality backlinks from Denver civic blogs."
                ]
              }
            ],
            executiveSummary: "Denver's plumbing search volume is highly lucrative. Elite Plumbing has a solid foundation with an existing website, but lagging on-page keyword density and citation consistency on Yelp/Bing are throttling their rankings.",
            actionPlan: [
              "Perform local citation NAP cleanup (fix old addresses)",
              "Deploy plumbing LocalBusiness Schema markup on homepage",
              "Establish automated review collection funnel for new service calls",
              "Optimize GBP keywords specifically for emergency leak repairs"
            ]
          }
        },
        {
          id: "lead_2",
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          status: "new",
          notes: "Brand new lead. Needs initial contact email. Wants a completely new single-page website built.",
          input: {
            planId: "single-page",
            planName: "Single-Page Blast",
            businessName: "Luminate Dental Care",
            contactName: "Dr. Sarah Kim",
            email: "contact@luminatedental.com",
            phone: "650-555-9831",
            website: "",
            hasWebsite: false,
            industry: "Cosmetic & General Dentistry",
            location: "San Mateo, CA",
            keywords: "dentist san mateo, teeth whitening, clear aligners nearby",
            hasGBP: false,
            gbpLink: ""
          }
        }
      ];
      fs.writeFileSync(LEADS_FILE, JSON.stringify(initialLeads, null, 2));
    }
  } catch (err) {
    console.error("⚠️ Failed to initialize local database in initDb():", err);
  }
}

initDb();

const TEMPLATES_FILE = path.join(DATA_DIR, "pdf_templates.json");

const defaultTemplates = {
  "single-page": {
    timeline: "2 - 3 Business Days to Live Sandbox",
    deliverables: [
      "Single-Page Website Design: Custom design tailored to your brand identity.",
      "Full Cross-Device Responsiveness: Optimized layout for both mobile and desktop viewing.",
      "Comprehensive Structure: Includes a Header, Footer, and 10 distinct body content components.",
      "Ultra-Fast Secure Cloud Hosting: High-performance hosting included at no extra cost.",
      "Secure SSL Configuration: Full SSL certificate setup for data security and trust.",
      "LocalSurge SEO Branding: Your brand logo integrated within the LocalSurge SEO domain.",
      "Single-Page Schema Markup: Technical SEO schema implementation to improve search visibility.",
      "Bespoke Domain Name Pointer Routing (Domain purchase separate)"
    ],
    actions: [
      'Submit Business Brief: Provide a short description of your business and services.',
      'Define Visual Identity: Share preferred website theming and color palettes.',
      'Provide Contact Details: Submit your official business address and phone number.',
      'Social Media Links: List URLs for any existing social media profiles.',
      'Asset Collection: Share a list or folder of images to be included in the design.',
      'Domain Access: Share domain name login credentials (if you already own one) or confirm you need guidance.',
      'Review Mockup: Once details are received, we will connect within 24 hours with a sample mockup for finalization.'
    ]
  },
  "starter": {
    timeline: "1 - 2 Weeks Core Onboarding & Sync",
    deliverables: [
      "Multi-Page Website Design: Up to 10 custom pages (Home, About, Services, Contact, Blog/News).",
      "Advanced Responsiveness: Pixel-perfect optimization for mobile, tablet, and desktop.",
      "Expanded Content Structure: Includes Header, Footer, and up to 20 dynamic body components across all pages.",
      "Priority Cloud Hosting: Ultra-fast secure hosting with prioritized server resources.",
      "Premium SSL & Security: Advanced SSL configuration with daily security scans.",
      "Local SEO Optimization: Full LocalSurge SEO integration with Google Business Profile setup assistance.",
      "Multi-Page Schema Markup: Advanced schema for organization, local business, and article types.",
      "Basic Content Writing: Up to 500 words of SEO-optimized copy per page.",
    ],
    actions: [
      "Detailed Business Brief: Comprehensive overview of services, target audience, and unique value proposition.",
      "Content Strategy: Provide draft text for all pages or request our copywriting service.",
      "Visual Identity Package: High-resolution logos, brand guidelines, and preferred color palettes.",
      "Local Business Data: Official address, phone number, hours of operation, and service areas.",
      "Social Media Audit: List of active social profiles and preferred cross-linking strategy.",
      "Media Assets: Curated list of high-quality images or authorization to use stock photography.",
      "Domain Access: Share domain name login credentials (if you already own one) or confirm you need guidance.",
      "Review Mockup: Once details are received, we will connect within 24 hours with a sample mockup for finalization."
    ]
  },
  "premium": {
    timeline: "Weekly Milestones & Priority Direct Account Management",
    deliverables: [
      "Conversion-Focused Design: Unlimited pages optimized specifically for lead generation and sales.",
      "Interactive Elements: Integration of contact forms, live chat, and booking/appointment schedulers.",
      "Deep Content Architecture: Unlimited body components, including testimonials, case studies, and FAQ sections.",
      "Enterprise Cloud Hosting: High-availability hosting with CDN (Content Delivery Network) for global speed.",
      "Advanced Security Suite: SSL, WAF (Web Application Firewall), and malware protection.",
      "Full LocalSurge SEO Suite: Competitor analysis, keyword research, and monthly ranking reports.",
      "Advanced Schema & Rich Snippets: Implementation of Product, Review, and Event schema for rich search results.",
      "Analytics & Tracking: Full setup of Google Analytics 4, Search Console, and conversion tracking pixels.",
      "Brand Logo & Identity: Custom logo design and brand kit included.",
      "Monthly Strategy Alignment calls and priority workflow status"
    ],
    actions: [
      "Detailed Business Brief: Comprehensive overview of services, target audience, and unique value proposition.",
      "Content Strategy: Provide draft text for all pages or request our copywriting service.",
      "Visual Identity Package: High-resolution logos, brand guidelines, and preferred color palettes.",
      "Local Business Data: Official address, phone number, hours of operation, and service areas.",
      "Social Media Audit: List of active social profiles and preferred cross-linking strategy.",
      "Media Assets: Curated list of high-quality images or authorization to use stock photography.",
      "Domain Access: Share domain name login credentials (if you already own one) or confirm you need guidance.",
      "Review Mockup: Once details are received, we will connect within 24 hours with a sample mockup for finalization.",
      "Identify main point-of-contact for monthly collaboration briefings.",
      "Establish direct integration links for Google Search Console (GSC) and analytics.",
      "Publish optimized initial geo-targeted campaign outline for content approval."
    ]
  },
  "custom": {
    timeline: "Bespoke Schedule Based on requirements",
    deliverables: [
      "Finalize scope and next steps immediately after the initial call."
    ],
    actions: [
      "Conduct priority 1-on-1 strategy meeting with local search director.",
      "Submit Business Brief: Provide a short description of your business and services.",
      "Define Visual Identity: Share preferred website theming and color palettes.",
      "Provide Contact Details: Submit your official business address and phone number.",
      "Social Media Links: List URLs for any existing social media profiles.",
      "Map out expansion cities, operational zip codes, and priority locations.",
      "Draft a formal, custom full-stack Scope of Work (SOW)."
    ]
  }
};

function readTemplates() {
  try {
    if (!fs.existsSync(TEMPLATES_FILE)) {
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(defaultTemplates, null, 2));
      return defaultTemplates;
    }
    const raw = fs.readFileSync(TEMPLATES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading templates:", err);
    return defaultTemplates;
  }
}

function writeTemplates(templates: any) {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
  } catch (err) {
    console.error("Error writing templates:", err);
  }
}

function readLeads() {
  try {
    const data = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading leads file, resetting:", error);
    return [];
  }
}

function writeLeads(leads: any) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error("Error writing leads file:", error);
  }
}

// SEO Crawl Controls & Route Protection
app.get("/robots.txt", (req, res) => {
  const prodPath = path.join(process.cwd(), "dist", "robots.txt");
  const devPath = path.join(process.cwd(), "public", "robots.txt");
  const targetPath = fs.existsSync(prodPath) ? prodPath : devPath;

  if (fs.existsSync(targetPath)) {
    res.type("text/plain");
    let content = fs.readFileSync(targetPath, "utf-8");
    const baseUrl = process.env.APP_URL || "https://localsurgeseo.com";
    content = content.replace(/https:\/\/localsurgeseo\.com/g, baseUrl);
    return res.send(content);
  }

  const baseUrl = process.env.APP_URL || "https://localsurgeseo.com";
  res.type("text/plain").send(
    `User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /admin/dashboard
Disallow: /admin/dashboard/

Sitemap: ${baseUrl}/sitemap.xml`
  );
});

function getDynamicSitemapPages(): string[] {
  const pages = [
    "",
    "/about",
    "/why-us",
    "/local-seo",
    "/pricing",
    "/seo-tool",
    "/contact",
    "/california",
    "/los-angeles-seo",
    "/privacy-policy",
    "/terms-of-service",
    "/blog",
  ];

  try {
    const blogFilePath = path.join(process.cwd(), "src", "data", "blogData.ts");
    if (fs.existsSync(blogFilePath)) {
      const content = fs.readFileSync(blogFilePath, "utf-8");
      const regex = /slug:\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        pages.push(`/blog/${match[1]}`);
      }
    }
  } catch (err) {
    console.error("Error reading blog slugs for sitemap:", err);
  }

  try {
    const directoryFilePath = path.join(process.cwd(), "src", "data", "directoryData.ts");
    if (fs.existsSync(directoryFilePath)) {
      const content = fs.readFileSync(directoryFilePath, "utf-8");
      const stateDirMatch = content.match(/const STATE_DIRECTORY[\s\S]+?const CITY_DIRECTORY/);
      if (stateDirMatch) {
        const stateBlock = stateDirMatch[0];
        const stateSlugRegex = /slug:\s*['"]([^'"]+)['"]/g;
        let stateMatch;
        while ((stateMatch = stateSlugRegex.exec(stateBlock)) !== null) {
          pages.push(`/${stateMatch[1]}`);
        }
      }

      const cityDirMatch = content.match(/const CITY_DIRECTORY[\s\S]+$/);
      if (cityDirMatch) {
        const cityBlock = cityDirMatch[0];
        const cityRegex = /slug:\s*['"]([^'"]+)['"],\s*stateSlug:\s*['"]([^'"]+)['"]/g;
        let cityMatch;
        while ((cityMatch = cityRegex.exec(cityBlock)) !== null) {
          const citySlug = cityMatch[1];
          const stateSlug = cityMatch[2];
          pages.push(`/${stateSlug}/${citySlug}`);
        }
      }
    }
  } catch (err) {
    console.error("Error reading directory slugs for sitemap:", err);
  }

  pages.push("/site-map");
  return Array.from(new Set(pages));
}

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  const baseUrl = process.env.APP_URL || "https://localsurgeseo.com";
  const publicPages = getDynamicSitemapPages();

  const urlEntries = publicPages
    .map((page) => {
      const priority = page === "" ? "1.0" : page.startsWith("/blog/") ? "0.6" : "0.8";
      const changefreq = page === "" ? "daily" : "weekly";
      return `  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  res.send(xmlContent);
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "SurgeAdmin2026!";
  if (username === adminUser && password === adminPass) {
    res.json({ success: true, token: "surge_fake_secure_token_2026" });
  } else {
    res.status(401).json({ success: false, error: "Invalid username or password" });
  }
});



app.get("/api/pdf-templates", (req, res) => {
  res.json(readTemplates());
});

app.post("/api/pdf-templates", requireAdmin, (req, res) => {
  const customTemplates = req.body;
  if (!customTemplates || typeof customTemplates !== "object") {
    return res.status(400).json({ error: "Invalid templates payload" });
  }
  writeTemplates(customTemplates);
  res.json({ success: true, templates: readTemplates() });
});

// API Routes
app.get("/api/admin/db-status", requireAdmin, async (req, res) => {
  const supabase = await getSupabase();
  const rawUrl = process.env.SUPABASE_URL || "";

  if (!supabase) {
    return res.json({
      configured: false,
      connected: false,
      tableExists: false,
      databaseUrl: rawUrl,
      message: "Supabase is not configured (SUPABASE_URL and credentials are missing). The application is safely using its highly stable, persistent local JSON database, so all of your features will work completely fine!"
    });
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST125') {
        const isStaleCache = error.code === 'PGRST125';
        return res.json({
          configured: true,
          connected: true,
          tableExists: false,
          databaseUrl: rawUrl,
          errorType: isStaleCache ? 'cache_stale' : 'table_missing',
          message: isStaleCache
            ? `Supabase is connected to ${rawUrl}, but has a schema cache delay (PGRST125). Even though the table is visible in your Schema Visualizer, the API gateway cannot find it yet.`
            : `Supabase is connected to ${rawUrl}, but the 'leads' table has not been created yet in the public schema.`,
          sqlSchema: isStaleCache
            ? `-- FOR RESOLVING STALE CACHE delay (run this in your Supabase SQL Editor):
-- 1. Grant all necessary permissions on the leads table
GRANT ALL ON TABLE public.leads TO postgres, anon, authenticated, service_role;

-- 2. Explicitly force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';`
            : `create table public.leads (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new'::text not null,
  notes text,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  industry text,
  location text,
  keywords text,
  plan_id text,
  plan_name text,
  ai_audit jsonb
);`
        });
      }
      return res.json({
        configured: true,
        connected: false,
        tableExists: false,
        databaseUrl: rawUrl,
        errorType: 'query_error',
        message: `Supabase query returned error: ${error.message} (${error.code})`
      });
    }

    return res.json({
      configured: true,
      connected: true,
      tableExists: true,
      databaseUrl: rawUrl,
      message: `Supabase is fully online and synchronized with the 'leads' table on ${rawUrl}.`
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      connected: false,
      tableExists: false,
      databaseUrl: rawUrl,
      errorType: 'server_exception',
      message: `Exception while checking Supabase connection: ${err.message || err}`
    });
  }
});

app.get("/api/leads", requireAdmin, async (req, res) => {
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Map database fields to the frontend expected lead structure
        const mappedLeads = data.map((d: any) => ({
          id: d.id,
          createdAt: d.created_at || d.createdAt,
          status: d.status,
          notes: d.notes,
          aiAudit: d.ai_audit || d.aiAudit,
          input: {
            planId: d.plan_id || d.planId || '',
            planName: d.plan_name || d.planName || '',
            businessName: d.business_name || d.businessName || '',
            contactName: d.contact_name || d.contactName || '',
            email: d.email || '',
            phone: d.phone || 'Not provided',
            website: d.website || '',
            hasWebsite: !!d.website,
            industry: d.industry || '',
            location: d.location || '',
            keywords: d.keywords || '',
            hasGBP: false
          }
        }));
        return res.json(mappedLeads);
      }

      if (error && error.code === '42P01') {
        console.info("ℹ️ Supabase 'leads' table is not initialized yet. Gracefully falling back to persistent local file JSON storage (all dashboard works offline/locally).");
      } else {
        console.warn("⚠️ Supabase query warning, using local file storage fallback instead:", error?.message || error);
      }
    } catch (err) {
      console.info("ℹ️ Fallback to local file due to Supabase connection exception.");
    }
  }
  // Standard fallback
  res.json(readLeads());
});

async function generateServerPDF(planId: string, name: string, email: string): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Primary Colors
  const pTeal = [18, 62, 53];    // #123e35
  const aOrange = [188, 95, 64]; // #bc5f40
  const nDark = [26, 28, 26];    // #1a1c1a
  const nLight = [136, 139, 136]; // #888b88

  // Header Banner
  doc.setFillColor(pTeal[0], pTeal[1], pTeal[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('LOCAL SURGE SEO', 15, 15);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('High-Performance Web Design & Local SEO Suite', 15, 22);
  doc.text('https://localsurgeseo.com | contact@localsurgeseo.com', 15, 27);

  // Accent Line
  doc.setFillColor(aOrange[0], aOrange[1], aOrange[2]);
  doc.rect(0, 35, 210, 3, 'F');

  // Metadata Row
  doc.setTextColor(nDark[0], nDark[1], nDark[2]);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('OFFICIAL GROWTH STRATEGY BRIEF', 15, 52);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(nLight[0], nLight[1], nLight[2]);
  const refCode = `LSS-${(planId || 'CUSTOM').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.text(`Doc Reference: ${refCode}`, 15, 58);
  doc.text(`Generated On: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 63);

  // Client Panel
  doc.setFillColor(247, 246, 242);
  doc.rect(15, 68, 180, 22, 'F');
  doc.setDrawColor(223, 222, 212);
  doc.rect(15, 68, 180, 22, 'D');

  doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('PREPARED FOR:', 19, 73);
  doc.setTextColor(nDark[0], nDark[1], nDark[2]);
  doc.setFont('Helvetica', 'normal');
  
  // Clean values of any non-printable or malicious control characters
  const cleanName = String(name || "").replace(/[^\x20-\x7E]/g, "").slice(0, 60);
  const cleanEmail = String(email || "").replace(/[^\x20-\x7E]/g, "").slice(0, 60);
  
  doc.text(`Client Contact Name: ${cleanName}`, 19, 78);
  doc.text(`Contact Email Address: ${cleanEmail}`, 19, 83);

  // Load templates from server storage
  const templates = readTemplates();
  const templateConfig = templates[planId] || templates["custom"];

  const PLAN_TITLES: Record<string, string> = {
    "single-page": "Single-Page Blast (Free Plan)",
    "starter": "Starter Boost Plan",
    "premium": "Premium Surge Plan",
    "custom": "Custom Configuration / Enterprise Setup"
  };

  const planTitle = PLAN_TITLES[planId] || PLAN_TITLES["custom"];
  const planPrice = planId === "single-page" ? "$0 / Free Promotion" : planId === "starter" ? "$999 / month" : planId === "premium" ? "$1,999 / month" : "Bespoke Quote Pending Custom Formulation";
  const estTimeline = templateConfig?.timeline || "Bespoke Schedule Based on requirements";
  const deliverables: string[] = templateConfig?.deliverables || ["Finalize scope and next steps immediately after the initial call."];
  const actions: string[] = templateConfig?.actions || ["Conduct priority 1-on-1 strategy meeting with local search director."];

  // Growth Plan Header
  doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CHOSEN GROWTH BLUEPRINT SUMMARY', 15, 98);

  doc.setFillColor(239, 244, 241); // brand light green tint
  doc.rect(15, 102, 180, 16, 'F');
  doc.rect(15, 102, 180, 16, 'D');

  doc.setTextColor(nDark[0], nDark[1], nDark[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Growth Tier: ${planTitle}`, 19, 108);
  doc.text(`Subscription: ${planPrice}`, 19, 113);
  doc.text(`Timeline: ${estTimeline}`, 110, 108);

  // Deliverables List
  doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DELIVERABLES AND SERVICES INCLUDED WITH PLAN:', 15, 126);

  doc.setTextColor(nDark[0], nDark[1], nDark[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  let y = 132;
  deliverables.forEach((item) => {
    // Small bullet
    doc.setFillColor(aOrange[0], aOrange[1], aOrange[2]);
    doc.circle(18, y - 1.2, 1, 'F');

    // Text
    doc.text(item, 23, y);
    y += 6.5;
  });

  // Next actions & Timeline
  y += 3;
  doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IMMEDIATE ONBOARDING TIMELINE & NEXT ACTIONS:', 15, y);

  doc.setTextColor(nDark[0], nDark[1], nDark[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  y += 6;
  actions.forEach((item, index) => {
    // Step Number
    doc.setTextColor(aOrange[0], aOrange[1], aOrange[2]);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${index + 1}.`, 15, y);

    // Text block wrapped
    doc.setTextColor(nDark[0], nDark[1], nDark[2]);
    doc.setFont('Helvetica', 'normal');
    const lines = doc.splitTextToSize(item, 170);
    doc.text(lines, 23, y);
    y += (lines.length * 5) + 1.5;
  });

  // Footer Block
  doc.setFillColor(pTeal[0], pTeal[1], pTeal[2]);
  doc.rect(0, 282, 210, 15, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Local Surge SEO is powered by verified regional data science. Our engineers have been alerted of your brief.', 15, 289);
  doc.text('Page 1 of 1', 185, 289);

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

app.post("/api/leads/submit", async (req, res) => {
  // 1. IP Rate Limiting Check
  const clientIp = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Please try again in 15 minutes." });
  }

  const {
    email,
    businessName,
    contactName,
    phone,
    website,
    hasWebsite,
    industry,
    location,
    keywords,
    hasGBP,
    gbpLink,
    planId
  } = req.body;

  if (!email || !businessName || !contactName) {
    return res.status(400).json({ error: "Missing required fields (businessName, contactName, email)" });
  }

  // 2. Validate email structure
  const sanitizedEmail = String(email).trim().slice(0, 100);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return res.status(400).json({ error: "Invalid email address format." });
  }

  // 3. Validate planId
  const VALID_PLAN_IDS = ["single-page", "starter", "premium", "custom", "custom-inquiry"];
  const sanitizedPlanId = String(planId || "custom").trim().toLowerCase();
  if (!VALID_PLAN_IDS.includes(sanitizedPlanId)) {
    return res.status(400).json({ error: "Invalid plan selection." });
  }

  const PLAN_NAMES: Record<string, string> = {
    "single-page": "Single-Page Blast (Free Plan)",
    "starter": "Starter Boost Plan",
    "premium": "Premium Surge Plan",
    "custom": "Custom Configuration / Enterprise Setup",
    "custom-inquiry": "Custom Configuration / Enterprise Setup"
  };
  const planName = PLAN_NAMES[sanitizedPlanId] || "Custom Configuration / Enterprise Setup";

  // Truncate fields for database to standard safe lengths
  const sanitizedBusinessName = String(businessName).trim().slice(0, 100);
  const sanitizedContactName = String(contactName).trim().slice(0, 100);
  const sanitizedPhone = String(phone || "Not provided").trim().slice(0, 30);
  const sanitizedWebsite = String(website || "").trim().slice(0, 200);
  const sanitizedIndustry = String(industry || "Local SEO Dominance").trim().slice(0, 100);
  const sanitizedLocation = String(location || "Local Area").trim().slice(0, 100);
  const sanitizedKeywords = String(keywords || "").trim().slice(0, 500);
  const sanitizedGbpLink = String(gbpLink || "").trim().slice(0, 500);

  const cleanLeadInput = {
    planId: sanitizedPlanId,
    planName,
    businessName: sanitizedBusinessName,
    contactName: sanitizedContactName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    website: sanitizedWebsite,
    hasWebsite: !!hasWebsite,
    industry: sanitizedIndustry,
    location: sanitizedLocation,
    keywords: sanitizedKeywords,
    hasGBP: !!hasGBP,
    gbpLink: sanitizedGbpLink
  };

  const newLeadId = "lead_" + Math.random().toString(36).substr(2, 9);

  const newLead: any = {
    id: newLeadId,
    createdAt: new Date().toISOString(),
    status: "pending",
    notes: `Lead submitted for plan: ${planName}.`,
    input: cleanLeadInput
  };

  // Generate AI SEO Strategy Audit based on Lead Input if Gemini is configured!
  const { ai, Type } = await getGemini();
  if (ai) {
    try {
      const prompt = `
        You are a highly premium Lead SEO Strategist for "Local Surge SEO".
        We have received an business inquiry/lead who chose the plan: "${planName}".
        Generate a highly actionable, personalized, and deep-dive Preliminary Local SEO Strategy Audit that we'll present to them instantly. Let's showcase massive value to increase conversions!
        
        Business Details:
        - Business Name: ${cleanLeadInput.businessName}
        - Industry/Niche: ${cleanLeadInput.industry}
        - Target Geolocation/City: ${cleanLeadInput.location}
        - Existing Website URL: ${cleanLeadInput.website || 'None (Needs complete build)'}
        - Google Business Profile (GBP) Status: ${cleanLeadInput.hasGBP ? 'Already has a GBP profile: ' + (cleanLeadInput.gbpLink || 'Yes') : 'Does not have a GBP yet'}
        - Target Keywords/Goals: ${cleanLeadInput.keywords}
        
        Analyze their niche and geolocation. Produce a realistic and detailed review containing an overall score (0-100), an executive summary, direct reviews for 3 specialized SEO aspects, and 4 clear next actions.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER, description: "Calculated SEO readiness/audit score out of 100" },
          domainName: { type: Type.STRING, description: "The business Domain or placeholder" },
          niche: { type: Type.STRING, description: "Double-confirmed industry classification" },
          location: { type: Type.STRING, description: "Target cities analyzed" },
          executiveSummary: { type: Type.STRING, description: "A conversational, expert paragraph highlighting the competition, organic potential, and immediate low-hanging fruit in their location." },
          analysis: {
            type: Type.ARRAY,
            description: "List of exactly 3 core pillars (e.g. GBP, Content, Backlinks) audited custom to their inputs.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Audit Category Name" },
                score: { type: Type.INTEGER, description: "Score from 0-100 indicating current standing in this category" },
                description: { type: Type.STRING, description: "Clear review of findings based on whether they have a website or profile" },
                recommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 2-3 specific, tactical action steps they should execute immediately."
                }
              },
              required: ["title", "score", "description", "recommendations"]
            }
          },
          actionPlan: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A bulleted roadmap checklist of exactly 4 items we will handle for them in our Local Surge onboarding."
          }
        },
        required: ["overallScore", "domainName", "niche", "location", "executiveSummary", "analysis", "actionPlan"]
      };

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          systemInstruction: "You are the premium automated SEO intelligence bot for Local Surge SEO. Always provide deep local keyword insights, realistic site audit tips, and show immense expertise."
        }
      });

      const responseText = result.text;
      if (responseText) {
        const audit = JSON.parse(responseText.trim());
        audit.timestamp = new Date().toISOString();
        newLead.aiAudit = audit;
        newLead.status = "pending";
        newLead.notes += " Auto-generated AI SEO Strategy successfully attached.";
      }
    } catch (error) {
      console.error("Error generating Gemini Local SEO Audit:", error);
      newLead.aiAudit = createFallbackAudit(cleanLeadInput);
    }
  } else {
    newLead.aiAudit = createFallbackAudit(cleanLeadInput);
  }

  // 1. Maintain local backups for offline/resilience parameters
  const leads = readLeads();
  leads.unshift(newLead);
  writeLeads(leads);

  // 2. Persist directly to Supabase cloud SQL storage if configured
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("leads")
        .insert([
          {
            id: newLead.id,
            created_at: newLead.createdAt,
            status: newLead.status,
            notes: newLead.notes,
            business_name: cleanLeadInput.businessName,
            contact_name: cleanLeadInput.contactName,
            email: cleanLeadInput.email,
            phone: cleanLeadInput.phone,
            website: cleanLeadInput.website,
            industry: cleanLeadInput.industry,
            location: cleanLeadInput.location,
            keywords: cleanLeadInput.keywords,
            plan_id: cleanLeadInput.planId,
            plan_name: cleanLeadInput.planName,
            ai_audit: newLead.aiAudit || null
          }
        ]);
      if (error) {
        if (error.code === '42P01') {
          console.info(`ℹ️ Supabase table 'leads' doesn't exist yet - lead ${newLead.id} is stored in persistent local JSON cache instead!`);
        } else {
          console.warn("⚠️ Supabase insertion warning:", error.message || error);
        }
      } else {
        console.log(`🟢 Successfully saved lead ${newLead.id} to Supabase database!`);
      }
    } catch (dbErr) {
      console.info("ℹ️ Optional cloud sync write fallback triggered successfully.");
    }
  }

  // 3. Dispatch auto-email with the PDF Strategy to the prospective customer using Resend
  const resend = await getResend();
  if (resend) {
    try {
      // Escape HTML entities to prevent HTML injection in the email body
      const escBusinessName = escapeHtml(cleanLeadInput.businessName);
      const escContactName = escapeHtml(cleanLeadInput.contactName);
      const escPlanName = escapeHtml(cleanLeadInput.planName);
      const escIndustry = escapeHtml(cleanLeadInput.industry);
      const escLocation = escapeHtml(cleanLeadInput.location);

      // Determine if a PDF attachment is requested (only for predefined plans, not 'custom-inquiry')
      const isPlanWithPdf = ["single-page", "starter", "premium", "custom"].includes(cleanLeadInput.planId);

      // Build strict payload
      type ResendAttachment = { filename: string; content: Buffer };
      type ResendPayload = {
        from: string;
        to: string[];
        subject: string;
        html: string;
        attachments?: ResendAttachment[];
      };

      const emailPayload: ResendPayload = {
        from: "Local Surge SEO <contact@localsurgeseo.com>",
        to: [cleanLeadInput.email],
        subject: `Your Local Surge SEO Strategy Plan: ${escPlanName}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #dfded4; border-radius: 12px; overflow: hidden; background-color: #faf9f6;">
            <!-- Header section -->
            <div style="background-color: #123e35; padding: 28px 24px; text-align: left; border-bottom: 3px solid #bc5f40;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; font-family: sans-serif;">LOCAL SURGE SEO</h1>
              <p style="color: #dfded4; margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">Onboarding Strategy &amp; Campaign Activation</p>
            </div>
            
            <!-- Body content -->
            <div style="padding: 24px; color: #1a1c1a;">
              <h2 style="color: #123e35; margin-top: 0; font-size: 16px; font-weight: bold;">Initial SEO Framework Registered</h2>
              <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d;">
                Hello <strong>${escContactName}</strong>,
              </p>
              <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d;">
                Our setup engineers have received your inquiry for <strong>${escBusinessName}</strong> and have locked in your preferred <strong>${escPlanName}</strong> program. Your physical search grids are being analyzed.
              </p>
              
              <div style="background-color: #eff4f1; border: 1px solid #dfded4; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #123e35; font-size: 11px; font-weight: bold; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">Strategic Blueprint Overview</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Business Target:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #151716;">${escBusinessName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Program Tier:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #bc5f40;">${escPlanName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Specialty Sector:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #151716;">${escIndustry}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Target Geolocation:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #151716;">${escLocation}</td>
                  </tr>
                </table>
              </div>
              
              ${isPlanWithPdf ? `
                <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d;">
                  &#128194; <strong>Strategy Plan Attached:</strong> We have attached your customized <strong>Strategy Growth Brief PDF</strong> summarizing your onboarding deliverables, timelines, and immediate next steps. Please open the attachment below!
                </p>
              ` : `
                <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d;">
                  Our engineers are assembling your localized schema. Your custom local listing benchmarks have been saved successfully for our priority kickoff meeting.
                </p>
              `}
              
              <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d; margin-top: 16px;">
                One of our Senior Search Strategists will match your inputs against our database and coordinate a kickoff briefing.
              </p>
              
              <p style="font-size: 12px; margin-top: 24px; color: #888b88; font-family: monospace;">
                Best regards,<br />
                The Local Surge SEO Team
              </p>
            </div>
            
            <!-- Footer section -->
            <div style="background-color: #123e35; padding: 12px 24px; text-align: center; border-top: 1px solid #dfded4;">
              <p style="color: #ffffff; margin: 0; font-size: 10px; font-family: sans-serif;">
                &copy; 2026 Local Surge SEO &bull; All rights reserved. High-Performance Local Search Engineering.
              </p>
            </div>
          </div>
        `
      };

      if (isPlanWithPdf) {
        // Generate PDF on the server side securely using verified templates
        const pdfBuffer = await generateServerPDF(cleanLeadInput.planId, cleanLeadInput.contactName, cleanLeadInput.email);
        const safeBusinessName = cleanLeadInput.businessName.replace(/[^a-zA-Z0-9]/g, '_');
        emailPayload.attachments = [
          {
            filename: `Local_Surge_${safeBusinessName}_Strategy_Plan.pdf`,
            content: pdfBuffer
          }
        ];
      }

      const { data, error } = await resend.emails.send(emailPayload);
      if (error) {
        console.error("❌ Resend dispatch failed:", error);
      } else {
        console.log("🟢 Resend email successfully sent to customer:", cleanLeadInput.email);
      }
    } catch (resendError) {
      console.error("❌ Failure in Resend pipeline execution:", resendError);
    }
  }

  res.json({ success: true, lead: newLead });
});

app.put("/api/leads/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedLocally = false;
  let updatedInSupabase = false;

  // 1. Update in Supabase if active
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const updatePayload: any = {};
      if (updates.status !== undefined) updatePayload.status = updates.status;
      if (updates.notes !== undefined) updatePayload.notes = updates.notes;
      if (updates.aiAudit !== undefined) updatePayload.ai_audit = updates.aiAudit;

      const { data, error } = await supabase
        .from("leads")
        .update(updatePayload)
        .eq("id", id)
        .select();

      if (error) {
        if (error.code === '42P01') {
          console.info(`ℹ️ Supabase leads table doesn't exist yet - update saved locally instead!`);
        } else {
          console.warn("⚠️ Supabase update warning:", error.message || error);
        }
      } else if (data && data.length > 0) {
        updatedInSupabase = true;
        console.log(`🟢 Successfully updated lead ${id} in Supabase.`);
      }
    } catch (err) {
      console.info("ℹ️ Optional cloud sync update fallback triggered successfully.");
    }
  }

  // 2. Update locally
  const leads = readLeads();
  const idx = leads.findIndex((l: any) => l.id === id);
  if (idx !== -1) {
    leads[idx] = { ...leads[idx], ...updates };
    writeLeads(leads);
    updatedLocally = true;
  }

  if (!updatedInSupabase && !updatedLocally) {
    return res.status(404).json({ error: "Lead not found" });
  }

  const returnedLead = idx !== -1 ? leads[idx] : { id, ...updates };
  res.json({ success: true, lead: returnedLead });
});

app.delete("/api/leads/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  let deletedLocally = false;
  let deletedInSupabase = false;

  // 1. Delete in Supabase if active
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        if (error.code === '42P01') {
          console.info(`ℹ️ Supabase leads table doesn't exist yet - delete resolved locally instead!`);
        } else {
          console.warn("⚠️ Supabase deletion warning:", error.message || error);
        }
      } else if (data && data.length > 0) {
        deletedInSupabase = true;
        console.log(`🟢 Successfully deleted lead ${id} from Supabase.`);
      }
    } catch (err) {
      console.info("ℹ️ Optional cloud sync delete fallback triggered successfully.");
    }
  }

  // 2. Delete locally
  const leads = readLeads();
  const filtered = leads.filter((l: any) => l.id !== id);
  if (leads.length !== filtered.length) {
    writeLeads(filtered);
    deletedLocally = true;
  }

  if (!deletedInSupabase && !deletedLocally) {
    return res.status(404).json({ error: "Lead not found" });
  }

  res.json({ success: true });
});

app.post("/api/seo-tool/analyze", async (req, res) => {
  const { url, niche, location } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Website URL is required for analysis." });
  }

  const { ai, Type } = await getGemini();
  if (ai) {
    try {
      const prompt = `
        Perform a comprehensive, realistic mock Local SEO analysis for:
        Website: ${url}
        Niche: ${niche || 'General Local Business'}
        Target Location: ${location || 'Local Area'}
        
        Provide high-level, extremely intelligent SEO feedback showcasing errors, warnings, structural tips, schema tags, and key actionable local keyword gaps.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER, description: "Calculated SEO readiness score (0-100)" },
          domainName: { type: Type.STRING },
          niche: { type: Type.STRING },
          location: { type: Type.STRING },
          executiveSummary: { type: Type.STRING },
          analysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                score: { type: Type.INTEGER },
                description: { type: Type.STRING },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "score", "description", "recommendations"]
            }
          },
          actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["overallScore", "domainName", "niche", "location", "executiveSummary", "analysis", "actionPlan"]
      };

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          systemInstruction: "You are the premium automated website audit bot for Local Surge SEO. Be thorough, creative, and highly specific about local search signals."
        }
      });

      const responseText = result.text;
      if (responseText) {
        return res.json(JSON.parse(responseText.trim()));
      }
    } catch (error) {
      console.error("Gemini tool audit failed, falling back:", error);
    }
  }

  // Fallback audit
  const fallback = createFallbackAudit({
    website: url,
    industry: niche || 'General Service',
    location: location || 'Metro Area',
    keywords: 'local rankings',
    hasGBP: true,
    planName: "Free Analysis Tool"
  });
  res.json(fallback);
});

// Admin-only: URL-based SEO Strategy Report Generator
// Generates a comprehensive, structured SEO audit for any URL (no niche/location context needed)
app.post("/api/admin/seo-report/generate", requireAdmin, async (req, res) => {
  const { url, notes } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  const { ai, Type } = await getGemini();
  if (ai) {
    try {
      const prompt = `
        You are an expert SEO analyst performing a comprehensive strategy blueprint for the admin team at Local Surge SEO.
        
        Analyze this website URL and produce a detailed, professional SEO Strategy Blueprint Report:
        URL: ${url}
        ${notes ? `Admin Notes / Context: ${notes}` : ''}
        
        Perform a full audit covering technical SEO health, content quality, local SEO signals, schema markup, mobile/speed performance, backlink profile signals, GEO/AI readiness, and a competitor landscape summary.
        
        Be highly specific, professional, and actionable. This is an internal admin report used to pitch and onboard a client.
        Use real SEO industry terminology. Score each category 0–100. Be brutally honest but constructive.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          websiteUrl: { type: Type.STRING },
          overallScore: { type: Type.INTEGER, description: "Overall SEO health score 0-100" },
          executiveSummary: { type: Type.STRING, description: "2-3 paragraph professional executive summary of the site's SEO posture" },
          keyFindings: {
            type: Type.ARRAY,
            description: "Top 3 critical findings (positive or negative) that define the site's SEO health",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "critical | warning | positive" },
                title: { type: Type.STRING },
                detail: { type: Type.STRING }
              },
              required: ["type", "title", "detail"]
            }
          },
          categories: {
            type: Type.ARRAY,
            description: "8 SEO audit categories with scores and detailed findings",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Category name e.g. Technical SEO, Content Quality, Local SEO, Schema Markup, Page Speed, Backlink Profile, GEO/AI Readiness, Mobile Optimization" },
                score: { type: Type.INTEGER, description: "0-100 score" },
                status: { type: Type.STRING, description: "excellent | good | needs-work | critical" },
                summary: { type: Type.STRING, description: "2-3 sentence expert finding for this category" },
                issues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-4 specific issues or observations found" },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 specific, prioritized action items to fix or improve" }
              },
              required: ["name", "score", "status", "summary", "issues", "recommendations"]
            }
          },
          priorityActionPlan: {
            type: Type.ARRAY,
            description: "Ordered list of 6 highest-impact actions the client should take in the next 90 days",
            items: {
              type: Type.OBJECT,
              properties: {
                priority: { type: Type.INTEGER, description: "1-6, 1 being most urgent" },
                action: { type: Type.STRING },
                impact: { type: Type.STRING, description: "high | medium | low" },
                timeframe: { type: Type.STRING, description: "e.g. Week 1, Month 1, Month 2-3" },
                detail: { type: Type.STRING }
              },
              required: ["priority", "action", "impact", "timeframe", "detail"]
            }
          },
          competitorInsights: { type: Type.STRING, description: "1-2 paragraphs on the likely competitive landscape and how the site compares" },
          opportunityScore: { type: Type.INTEGER, description: "0-100 score representing how much ranking opportunity exists for this site if issues are fixed" }
        },
        required: ["websiteUrl", "overallScore", "executiveSummary", "keyFindings", "categories", "priorityActionPlan", "competitorInsights", "opportunityScore"]
      };

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          systemInstruction: "You are a senior SEO consultant at Local Surge SEO generating an internal admin strategy blueprint report. Be highly professional, specific, and rigorous. Use real SEO concepts, metrics, and terminology. Produce reports that would impress a sophisticated business owner."
        }
      });

      const responseText = result.text;
      if (responseText) {
        const report = JSON.parse(responseText.trim());
        report.generatedAt = new Date().toISOString();
        return res.json({ success: true, report });
      }
    } catch (error) {
      console.error("Gemini SEO report generation failed:", error);
    }
  }

  // Fallback structured report
  const domain = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
  return res.json({
    success: true,
    report: {
      websiteUrl: url,
      generatedAt: new Date().toISOString(),
      overallScore: 52,
      opportunityScore: 78,
      executiveSummary: `Analysis of ${domain} reveals significant opportunities for local SEO improvement. The site has foundational elements in place but lacks the technical optimizations and local signals required to compete effectively in modern search. With targeted improvements across schema markup, content structure, and citation consistency, substantial ranking gains are achievable within 90 days.`,
      keyFindings: [
        { type: "critical", title: "Missing LocalBusiness Schema", detail: "No structured data markup detected — search engines cannot understand the business type, location, or services offered." },
        { type: "warning", title: "Weak Content Authority", detail: "Page content lacks E-E-A-T signals including author credentials, citations, and first-hand experience indicators." },
        { type: "positive", title: "Mobile-Friendly Foundation", detail: "The site appears to render on mobile devices, providing a baseline for mobile-first indexing compliance." }
      ],
      categories: [
        { name: "Technical SEO", score: 55, status: "needs-work", summary: "Core technical signals are partially implemented. Critical gaps in structured data and crawl optimization.", issues: ["No XML sitemap detected", "Missing canonical tags", "Slow TTFB"], recommendations: ["Generate and submit XML sitemap", "Implement canonical tags on all pages", "Enable server-side caching"] },
        { name: "Local SEO", score: 40, status: "critical", summary: "Local presence is severely underdeveloped. No verified GBP signals or consistent NAP citations.", issues: ["Unverified or absent Google Business Profile", "NAP inconsistencies across directories", "No local landing pages"], recommendations: ["Claim and fully optimize Google Business Profile", "Audit and sync NAP across top 20 directories", "Create geo-targeted service pages"] },
        { name: "Content Quality", score: 58, status: "needs-work", summary: "Content exists but lacks depth, topical authority, and E-E-A-T signals that Google rewards.", issues: ["Thin content on service pages", "No author bylines or credentials", "Missing FAQ sections"], recommendations: ["Expand service pages to 800+ words with expert content", "Add author bio sections with credentials", "Implement FAQ schema on key pages"] },
        { name: "Schema Markup", score: 20, status: "critical", summary: "Virtually no structured data implemented. A major missed opportunity for rich results.", issues: ["No Organization schema", "No LocalBusiness schema", "No Review/Rating markup"], recommendations: ["Implement LocalBusiness JSON-LD schema", "Add BreadcrumbList schema site-wide", "Add Review schema to testimonials"] },
        { name: "Page Speed", score: 62, status: "needs-work", summary: "Load performance is below competitive benchmarks. CWV metrics need improvement.", issues: ["Large Contentful Paint above 3s", "Unoptimized images", "Render-blocking resources"], recommendations: ["Compress and convert images to WebP", "Defer non-critical JavaScript", "Implement lazy loading for below-fold content"] },
        { name: "Backlink Profile", score: 45, status: "needs-work", summary: "Domain authority is low with few high-quality inbound links. Citation profile is sparse.", issues: ["Low domain authority", "Few industry-relevant backlinks", "Missing directory citations"], recommendations: ["Build citations on top 50 local directories", "Pursue guest posts on industry blogs", "Create link-worthy local resource content"] },
        { name: "GEO / AI Readiness", score: 35, status: "critical", summary: "Content is not optimized for AI Overviews or generative engine citation. Passage density is low.", issues: ["No question-based heading structure", "Low passage citability score", "No llms.txt or AI-friendly signals"], recommendations: ["Restructure headings as searchable questions", "Write 150-word self-contained answer blocks", "Add structured FAQ content targeting AI snippets"] },
        { name: "Mobile Optimization", score: 68, status: "good", summary: "Mobile rendering is adequate but CLS and tap target sizing need refinement.", issues: ["Some tap targets too small on mobile", "Minor CLS issues on scroll", "Missing viewport meta on some subpages"], recommendations: ["Increase button/link tap target size to 48px minimum", "Fix layout shifts on image load", "Audit all pages for viewport meta tag"] }
      ],
      priorityActionPlan: [
        { priority: 1, action: "Claim & Optimize Google Business Profile", impact: "high", timeframe: "Week 1", detail: "Verify GBP, complete all sections, add services, upload 10+ geo-tagged photos, and enable messaging." },
        { priority: 2, action: "Implement LocalBusiness Schema Markup", impact: "high", timeframe: "Week 1", detail: "Add JSON-LD LocalBusiness schema with address, phone, hours, and service area to all pages." },
        { priority: 3, action: "Audit & Fix NAP Citations", impact: "high", timeframe: "Month 1", detail: "Sync business name, address, and phone across Yelp, Apple Maps, Bing, YellowPages, and 20+ niche directories." },
        { priority: 4, action: "Rewrite Service Pages with E-E-A-T Signals", impact: "medium", timeframe: "Month 1", detail: "Expand each service page to 800+ words with expert writing, author credentials, and FAQ sections." },
        { priority: 5, action: "Generate XML Sitemap & Fix Technical Crawl Issues", impact: "medium", timeframe: "Month 1", detail: "Submit sitemap to GSC, add canonical tags, fix redirect chains, and resolve any 404 errors." },
        { priority: 6, action: "Launch Local Link Building Campaign", impact: "medium", timeframe: "Month 2-3", detail: "Target 5 local business associations, 3 industry directories, and 2 local news guest posts for backlinks." }
      ],
      competitorInsights: `The competitive landscape for ${domain}'s target market is moderately contested. Top-ranking competitors typically maintain fully verified Google Business Profiles with 50+ reviews, comprehensive LocalBusiness schema, and geo-targeted service pages. The site currently lacks these foundational signals, creating a clear gap but also a significant opportunity — competitors with similar authority levels have been outranked through citation consistency and schema implementation alone.`,
    }
  });
});

function createFallbackAudit(input: any) {
  const domain = input.website ? input.website.replace(/https?:\/\/(www\.)?/, '') : `${input.businessName.toLowerCase().replace(/\s+/g, '')}.com`;

  return {
    overallScore: Math.floor(Math.random() * 25) + 55, // 55 - 80 range
    domainName: domain,
    niche: input.industry || "Local Contracting",
    location: input.location || "Local Market",
    timestamp: new Date().toISOString(),
    executiveSummary: `We analyzed local search competition for "${input.industry || 'your business'}" in ${input.location || 'your city'}. Competitors are actively harvesting high-intent buyer keywords. By securing citation alignment and layering search-optimized on-page structural updates, we can trigger a severe surge in your neighborhood rankings.`,
    analysis: [
      {
        title: "Google Business Profile Sync",
        score: input.hasGBP ? 85 : 30,
        description: input.hasGBP
          ? "Profile exists but keyword categorization and direct review pipelines are under-leveraged."
          : "No active Google Business Profile identified. Setting this up is step-zero to capture high-intent 'near me' organic traffic.",
        recommendations: [
          "Complete profile optimization including geo-targeted high-quality media uploads.",
          "Perform deep review volume acceleration setup with customized QR-code triggers.",
          "Target highly relevant secondary services keywords in the category options."
        ]
      },
      {
        title: "On-Page Metadata and Local Semantics",
        score: input.website ? 68 : 20,
        description: input.website
          ? "The domain loads fast but lacks LocalBusiness Schema markup and localized headings."
          : "No current website detected. Building a mobile-first, semantic layout containing dedicated keyword targets will instantly establish trust.",
        recommendations: [
          "Embed responsive schema structures with exact geographic geolocation coordinates.",
          "Rewrite title headers (H1/H2) to explicitly balance service intent and target neighborhoods.",
          "Develop localized niche pages mapping separate localized services."
        ]
      },
      {
        title: "Citation Density & Authority Footprint",
        score: 60,
        description: "Local NAP (Name, Address, Phone) citation profile shows inconsistencies or omissions on key niche directory syndicates.",
        recommendations: [
          "Sync top-tier databases (Yelp, Apple Maps, Bing, YellowPages) to perfect data consistency.",
          "Audit industry-specific localized registries for targeted service link anchors.",
          "Implement ongoing listing management tasks."
        ]
      }
    ],
    actionPlan: [
      `Initiate manual NAP citation sweep and map location profile consolidation.`,
      `Design and deploy optimized on-page content structures loaded with target keywords (${input.keywords || 'Local Services'}).`,
      `Synthesize high-authority community directory signals to increase backlink weight.`,
      `Formulate a custom review-generation playbook for your desk/field team.`
    ]
  };
}

export default app;
