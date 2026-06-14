import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = 3000;

// Set generous payload size limit to accept base64-encoded PDF documents safely
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializers for premium integrations to prevent app crashes if keys are not set up yet
let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    // Prioritize SUPABASE_SERVICE_ROLE_KEY for robust backend queries that bypass RLS policies
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
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
function getResend() {
  if (!resendClient) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
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

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ GEMINI_API_KEY is not defined. AI features will fallback to high-quality mock data.");
}

// Database helper
const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function initDb() {
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
}

initDb();

const TEMPLATES_FILE = path.join(DATA_DIR, "pdf_templates.json");

const defaultTemplates = {
  "single-page": {
    timeline: "2 - 3 Business Days to Live Sandbox",
    deliverables: [
      "Premium Single-Page Fast Storefront Website Design",
      "Fully Responsive & Mobile-Optimized Layout Structure",
      "On-Page Local SEO Setup (Keywords, Heading hierarchies)",
      "Ultra-Fast secure Cloud-Hosted Payload hosting",
      "Secure SSL Certificate configuration & active mapping",
      "Bespoke Domain Name Pointer Routing (Domain purchase separate)"
    ],
    actions: [
      "Secure standard location info, target keywords, business description & graphics.",
      "Bootstrap highly optimized sandbox layout draft & share staging address.",
      "Gather direct customer design reviews and execute final refinements.",
      "Activate DNS primary domains records and propagate web-wide."
    ]
  },
  "starter": {
    timeline: "1 - 2 Weeks Core Onboarding & Sync",
    deliverables: [
      "Google Business Profile (GBP) deep synchronization & setup verification",
      "High-converting, action-oriented Lead Form integration & coding",
      "Comprehensive Localized Keyword Research covering 10 major buyer terms",
      "Top 20 absolute primary Directory Citation syndications (Apple, MapQuest, Yelp)",
      "Basic On-Page Geographic Silos tuning and local metadata markup",
      "Monthly search rankings dashboard and phone-tap tracking reports"
    ],
    actions: [
      "Grant Manager access delegation for existing or new Google Business Profile.",
      "Define key physical service regions, target zip codes, and hours parameters.",
      "Scrub and eliminate redundant, mismatched historical NAP directory citations.",
      "Trigger automated keyword ranking monitors for active regional status assessment."
    ]
  },
  "premium": {
    timeline: "Weekly Milestones & Priority Direct Account Management",
    deliverables: [
      "Everything in Starter Boost (All map rankings services included)",
      "Interactive, rich LocalBusiness Schema Markup installations (JSON-LD)",
      "High-authority regional niche backlinking for accelerated ranking growth",
      "4 custom geo-targeted Local Industry Blog Articles published monthly",
      "Bespoke multi-page expansion silo content strategy mapping",
      "Dedicated senior Local SEO Account Representative",
      "Bi-weekly Strategy Alignment calls and priority workflow status"
    ],
    actions: [
      "Identify main point-of-contact for bi-weekly collaboration briefings.",
      "Establish direct integration links for Google Search Console (GSC) and analytics.",
      "Publish optimized initial geo-targeted campaign outline for content approval.",
      "Produce robust geographic competitor rankings grid review."
    ]
  },
  "custom": {
    timeline: "Bespoke Schedule Based on Multi-City Scope",
    deliverables: [
      "Bespoke multi-location regional strategy structuring & silos setup",
      "Enterprise-grade multi-page location directories architecture matching 10+ cities",
      "Custom local schema template configurations & advanced page load speed tuning",
      "Tailored high-volume citation audits and priority Google Maps troubleshooting",
      "Omnichannel search marketing reports for headquarters & branch partners"
    ],
    actions: [
      "Conduct priority 1-on-1 strategy meeting with local search director.",
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
  res.type("text/plain");
  const baseUrl = process.env.APP_URL || "https://localsurgeseo.com";
  res.send(
`User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /admin/dashboard
Disallow: /admin/dashboard/

Sitemap: ${baseUrl}/sitemap.xml`
  );
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  const baseUrl = process.env.APP_URL || "https://localsurgeseo.com";
  const publicPages = [
    "",
    "/about",
    "/why-us",
    "/pricing",
    "/seo-tool",
    "/contact",
    "/blog",
    "/blog/google-business-profile-critical-local-contractors",
    "/blog/single-page-blueprint-dominate-local-search",
    "/blog/top-on-page-seo-mistakes-local-businesses-make",
    "/blog/unlocking-the-power-of-local-seo-for-small-businesses",
    "/blog/from-zero-to-hero-scaling-your-local-seo-strategy",
    "/blog/mastering-google-business-profile-optimization",
    "/blog/why-your-business-needs-local-seo-now",
    "/site-map",
  ];

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

app.post("/api/pdf-templates", (req, res) => {
  const customTemplates = req.body;
  if (!customTemplates || typeof customTemplates !== "object") {
    return res.status(400).json({ error: "Invalid templates payload" });
  }
  writeTemplates(customTemplates);
  res.json({ success: true, templates: readTemplates() });
});

// API Routes
app.get("/api/admin/db-status", async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.json({
      configured: false,
      connected: false,
      tableExists: false,
      message: "Supabase is not configured (SUPABASE_URL and credentials are missing). The application is safely using its highly stable, persistent local JSON database, so all of your features will work completely fine!"
    });
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        return res.json({
          configured: true,
          connected: true,
          tableExists: false,
          errorType: 'table_missing',
          message: "Supabase connected successfully, but the 'leads' table has not been created yet.",
          sqlSchema: `create table public.leads (
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
        errorType: 'query_error',
        message: `Supabase query returned error: ${error.message} (${error.code})`
      });
    }

    return res.json({
      configured: true,
      connected: true,
      tableExists: true,
      message: "Supabase is fully online and synchronized with the 'leads' table."
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      connected: false,
      tableExists: false,
      errorType: 'server_exception',
      message: `Exception while checking Supabase connection: ${err.message || err}`
    });
  }
});

app.get("/api/leads", async (req, res) => {
  const supabase = getSupabase();
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

app.post("/api/leads/submit", async (req, res) => {
  const leadInput = req.body;
  
  if (!leadInput.email || !leadInput.businessName || !leadInput.contactName) {
    return res.status(400).json({ error: "Missing required fields (businessName, contactName, email)" });
  }

  const newLeadId = "lead_" + Math.random().toString(36).substr(2, 9);
  
  const newLead: any = {
    id: newLeadId,
    createdAt: new Date().toISOString(),
    status: "pending",
    notes: `Lead submitted for plan: ${leadInput.planName}.`,
    input: leadInput
  };

  // Generate AI SEO Strategy Audit based on Lead Input if Gemini is configured!
  if (ai) {
    try {
      const prompt = `
        You are a highly premium Lead SEO Strategist for "Local Surge SEO".
        We have received an business inquiry/lead who chose the plan: "${leadInput.planName}".
        Generate a highly actionable, personalized, and deep-dive Preliminary Local SEO Strategy Audit that we'll present to them instantly. Let's showcase massive value to increase conversions!
        
        Business Details:
        - Business Name: ${leadInput.businessName}
        - Industry/Niche: ${leadInput.industry}
        - Target Geolocation/City: ${leadInput.location}
        - Existing Website URL: ${leadInput.website || 'None (Needs complete build)'}
        - Google Business Profile (GBP) Status: ${leadInput.hasGBP ? 'Already has a GBP profile: ' + (leadInput.gbpLink || 'Yes') : 'Does not have a GBP yet'}
        - Target Keywords/Goals: ${leadInput.keywords}
        
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
      newLead.aiAudit = createFallbackAudit(leadInput);
    }
  } else {
    newLead.aiAudit = createFallbackAudit(leadInput);
  }

  // 1. Maintain local backups for offline/resilience parameters
  const leads = readLeads();
  leads.unshift(newLead);
  writeLeads(leads);

  // 2. Persist directly to Supabase cloud SQL storage if configured
  const supabase = getSupabase();
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
            business_name: leadInput.businessName,
            contact_name: leadInput.contactName,
            email: leadInput.email,
            phone: leadInput.phone || 'Not provided',
            website: leadInput.website || '',
            industry: leadInput.industry || '',
            location: leadInput.location || '',
            keywords: leadInput.keywords || '',
            plan_id: leadInput.planId || '',
            plan_name: leadInput.planName || '',
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
  const resend = getResend();
  if (resend) {
    try {
      const safeBusinessName = leadInput.businessName.replace(/[^a-zA-Z0-9]/g, '_');
      const emailPayload: any = {
        from: "Local Surge SEO <onboarding@resend.dev>",
        to: [leadInput.email],
        subject: `Your Local Surge SEO Strategy Plan: ${leadInput.planName}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #dfded4; border-radius: 12px; overflow: hidden; background-color: #faf9f6;">
            <!-- Header section -->
            <div style="background-color: #123e35; padding: 28px 24px; text-align: left; border-bottom: 3px solid #bc5f40;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; font-family: sans-serif;">LOCAL SURGE SEO</h1>
              <p style="color: #dfded4; margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">Onboarding Strategy & Campaign Activation</p>
            </div>
            
            <!-- Body content -->
            <div style="padding: 24px; color: #1a1c1a;">
              <h2 style="color: #123e35; margin-top: 0; font-size: 16px; font-weight: bold;">Initial SEO Framework Registered</h2>
              <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d;">
                Hello <strong>${leadInput.contactName}</strong>,
              </p>
              <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d;">
                Our setup engineers have received your inquiry for <strong>${leadInput.businessName}</strong> and have locked in your prefered <strong>${leadInput.planName}</strong> program. Your physical search grids are being analyzed.
              </p>
              
              <div style="background-color: #eff4f1; border: 1px solid #dfded4; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #123e35; font-size: 11px; font-weight: bold; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">Strategic Blueprint Overview</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Business Target:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #151716;">${leadInput.businessName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Program Tier:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #bc5f40;">${leadInput.planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Specialty Sector:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #151716;">${leadInput.industry || 'Local SEO Dominance'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #888b88;">Target Geolocation:</td>
                    <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #151716;">${leadInput.location || 'Local Area'}</td>
                  </tr>
                </table>
              </div>
              
              ${leadInput.pdfBase64 ? `
                <p style="font-size: 13.5px; line-height: 1.5; color: #2d2f2d;">
                  📂 <strong>Strategy Plan Attached:</strong> We have attached your pixel-perfect customized <strong>Strategy Growth Brief PDF</strong> summarizing your onboarding deliverables, timelines, and immediate sequence. Please open the attachment below!
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
                © 2026 Local Surge SEO • All rights reserved. High-Performance Local Search Engineering.
              </p>
            </div>
          </div>
        `
      };

      if (leadInput.pdfBase64) {
        emailPayload.attachments = [
          {
            filename: `Local_Surge_${safeBusinessName}_Strategy_Plan.pdf`,
            content: Buffer.from(leadInput.pdfBase64, "base64")
          }
        ];
      }

      const { data, error } = await resend.emails.send(emailPayload);
      if (error) {
        console.error("❌ Resend dispatch failed:", error);
      } else {
        console.log("🟢 Resend email successfully sent to customer:", leadInput.email);
      }
    } catch (resendError) {
      console.error("❌ Failure in Resend pipeline execution:", resendError);
    }
  }

  res.json({ success: true, lead: newLead });
});

app.put("/api/leads/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const leads = readLeads();
  const idx = leads.findIndex((l: any) => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }

  leads[idx] = { ...leads[idx], ...updates };
  writeLeads(leads);

  // Update in Supabase if active
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status: updates.status,
          notes: updates.notes,
          ai_audit: updates.aiAudit || null
        })
        .eq("id", id);
      if (error) {
        if (error.code === '42P01') {
          console.info(`ℹ️ Supabase leads table doesn't exist yet - update saved locally instead!`);
        } else {
          console.warn("⚠️ Supabase update warning:", error.message || error);
        }
      } else {
        console.log(`🟢 Successfully updated lead ${id} in Supabase.`);
      }
    } catch (err) {
      console.info("ℹ️ Optional cloud sync update fallback triggered successfully.");
    }
  }

  res.json({ success: true, lead: leads[idx] });
});

app.delete("/api/leads/:id", async (req, res) => {
  const { id } = req.params;
  const leads = readLeads();
  const filtered = leads.filter((l: any) => l.id !== id);
  if (leads.length === filtered.length) {
    return res.status(404).json({ error: "Lead not found" });
  }
  writeLeads(filtered);

  // Delete in Supabase if active
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);
      if (error) {
        if (error.code === '42P01') {
          console.info(`ℹ️ Supabase leads table doesn't exist yet - delete resolved locally instead!`);
        } else {
          console.warn("⚠️ Supabase deletion warning:", error.message || error);
        }
      } else {
        console.log(`🟢 Successfully deleted lead ${id} from Supabase.`);
      }
    } catch (err) {
      console.info("ℹ️ Optional cloud sync delete fallback triggered successfully.");
    }
  }

  res.json({ success: true });
});

app.post("/api/seo-tool/analyze", async (req, res) => {
  const { url, niche, location } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Website URL is required for analysis." });
  }

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

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
