import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
    "/blog/avoid-slow-cooker-disasters-with-these-crockpot-safety-tips",
    "/blog/google-business-profile-critical-local-contractors",
    "/blog/single-page-blueprint-dominate-local-search",
    "/blog/top-on-page-seo-mistakes-local-businesses-make",
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

// API Routes
app.get("/api/leads", (req, res) => {
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
    status: "new",
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
        newLead.status = "audit_prepared";
        newLead.notes += " Auto-generated AI SEO Strategy successfully attached.";
      }
    } catch (error) {
      console.error("Error generating Gemini Local SEO Audit:", error);
      // Fallback preset strategy in case of API failure
      newLead.aiAudit = createFallbackAudit(leadInput);
    }
  } else {
    // Generate static mockup audit instantly if no key is defined
    newLead.aiAudit = createFallbackAudit(leadInput);
  }

  const leads = readLeads();
  leads.unshift(newLead);
  writeLeads(leads);

  console.log(`✉️ Email would be dispatched to contact@localsurgeseo.com informing them of lead ${newLeadId} [${leadInput.businessName}] for plan ${leadInput.planName}`);

  res.json({ success: true, lead: newLead });
});

app.put("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const leads = readLeads();
  const idx = leads.findIndex((l: any) => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }

  leads[idx] = { ...leads[idx], ...updates };
  writeLeads(leads);
  res.json({ success: true, lead: leads[idx] });
});

app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const leads = readLeads();
  const filtered = leads.filter((l: any) => l.id !== id);
  if (leads.length === filtered.length) {
    return res.status(404).json({ error: "Lead not found" });
  }
  writeLeads(filtered);
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

startServer();
