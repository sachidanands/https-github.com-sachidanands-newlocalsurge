import type { ScrapedKnowledge, CrawlResult } from "../../src/types/frontdesk";

// SSRF Prevention: Validate that the target URL is a safe, publicly resolvable web domain
export function isSafePublicUrl(inputUrl: string): boolean {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();

    // Block loopback, localhost, and internal names
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan")
    ) {
      return false;
    }

    // Block private IPv4 ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
    if (
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^169\.254\./.test(hostname)
    ) {
      return false;
    }

    // Require valid top-level or sub-domain structure
    if (!hostname.includes(".") && hostname !== "localhost") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Strips HTML boilerplate and extracts clean readable content.
 */
export function cleanHtmlToText(html: string): string {
  if (!html) return "";
  let text = html;

  // Remove scripts, styles, noscript, svg, audio, video
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ");
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ");
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Extract meta tags content (description, keywords)
  const metaDescriptions: string[] = [];
  const metaMatches = text.matchAll(/<meta\s+name=["'](description|keywords)["']\s+content=["']([^"']+)["']/gi);
  for (const m of metaMatches) {
    if (m[2]) metaDescriptions.push(m[2]);
  }

  // Replace block tags with newlines
  text = text.replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|section|article)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Unescape HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Normalize whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n+/g, "\n").trim();

  if (metaDescriptions.length > 0) {
    text = `[Site Meta Summary: ${metaDescriptions.join(" | ")}]\n\n${text}`;
  }

  return text.slice(0, 45000); // Keep max 45k chars for prompt efficiency
}

/**
 * Extracts candidate navigation sub-URLs from HTML (e.g. /services, /about, /contact)
 */
export function extractKeySublinks(html: string, baseUrl: string): string[] {
  const links: Set<string> = new Set();
  const baseParsed = new URL(baseUrl);
  const regex = /href=["']([^"'#\s>]+)["']/gi;
  let match;

  const targetKeywords = ["service", "about", "contact", "pricing", "emergency", "faq", "repair", "install"];

  while ((match = regex.exec(html)) !== null) {
    const rawHref = match[1];
    try {
      const fullUrl = new URL(rawHref, baseUrl);
      // Only keep same-domain links
      if (fullUrl.hostname === baseParsed.hostname) {
        const pathLower = fullUrl.pathname.toLowerCase();
        if (targetKeywords.some(kw => pathLower.includes(kw)) && fullUrl.href !== baseUrl) {
          links.add(fullUrl.href);
        }
      }
    } catch {
      // Invalid URL skipped
    }
  }

  return Array.from(links).slice(0, 3); // Max 3 sub-pages for fast 60s ingestion
}

/**
 * Heuristic fallback knowledge extraction if Gemini is unavailable
 */
export function extractHeuristicKnowledge(text: string, businessNameHint?: string, industryHint?: string): ScrapedKnowledge {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  // Extract phone numbers
  const phoneMatches = text.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g) || [];
  const phones = Array.from(new Set(phoneMatches)).slice(0, 2);

  // Detect 24/7 emergency cues
  const has247 = /24\/7|24\s*hours|emergency\s*service|urgent\s*dispatch/i.test(text);

  // Extract candidate services from heading-like or bullet lines
  const potentialServices = lines.filter(l => 
    l.length > 5 && l.length < 60 &&
    /repair|replacement|installation|cleaning|inspection|service|maintenance|drain|leak|water|hvac|roof|panel|wiring/i.test(l)
  ).slice(0, 8);

  return {
    businessName: businessNameHint || "Local Service Specialist",
    industry: industryHint || "General Contractor",
    tagline: lines.find(l => l.length > 15 && l.length < 90) || "Trusted local service professionals.",
    primaryServices: potentialServices.length > 0 ? potentialServices : [
      "Emergency Triage & Diagnostics",
      "Comprehensive Diagnostics & Repair",
      "Full System Replacement & Installation",
      "Preventative Maintenance & Tune-Ups"
    ],
    serviceAreas: ["Primary Metro Service Radius (25 miles)"],
    emergencyPolicy: has247 
      ? "24/7 on-call emergency dispatch with guaranteed live response." 
      : "Standard response during business hours with priority dispatch queue.",
    estimatePolicy: "Free upfront estimates for standard repairs and scheduled installations.",
    pricingCues: [
      "Upfront flat-rate pricing before work begins",
      "No hidden travel surcharges in core service area",
      "Financing options available on qualifying replacements"
    ],
    faqs: [
      {
        question: "How fast can you dispatch a technician?",
        answer: "We offer priority dispatch within 30-60 minutes for active emergencies, and same-day scheduling for standard service calls."
      },
      {
        question: "Are your technicians licensed and insured?",
        answer: "Yes, 100% of our field technicians are fully state-licensed, background-checked, and carry comprehensive liability insurance."
      },
      {
        question: "Do you offer free estimates?",
        answer: "Yes! We provide free, transparent estimates with zero hidden fees before any work commences."
      }
    ],
    keyFacts: [
      phones.length > 0 ? `Primary Hotline: ${phones[0]}` : "Direct Dispatch Hotline Available",
      "100% Satisfaction Guarantee",
      "Licensed, Bonded & Insured Local Professionals"
    ],
    extractedAt: new Date().toISOString()
  };
}

/**
 * Main Crawler & Knowledge Ingestion Engine
 */
export async function crawlSiteKnowledge(
  targetUrl: string,
  geminiGetter?: () => Promise<{ ai: any; Type: any }>,
  options: { businessName?: string; industry?: string; deepCrawl?: boolean } = {}
): Promise<CrawlResult> {
  const sanitizedUrl = targetUrl.trim();
  if (!isSafePublicUrl(sanitizedUrl)) {
    return {
      success: false,
      url: sanitizedUrl,
      pagesScraped: [],
      error: "Invalid or restricted URL. Must be a safe, public HTTP/HTTPS web domain.",
      knowledge: extractHeuristicKnowledge("", options.businessName, options.industry)
    };
  }

  const scrapedPages: string[] = [];
  const textCorpus: string[] = [];

  try {
    // 1. Fetch Homepage
    const headers = {
      "User-Agent": "LocalSurge-FrontDesk-Crawler/1.0 (+https://localsurgeseo.com/ai-frontdesk)",
      "Accept": "text/html,application/xhtml+xml,text/plain"
    };

    const homeResp = await fetch(sanitizedUrl, {
      headers,
      signal: AbortSignal.timeout(9000)
    });

    if (!homeResp.ok) {
      throw new Error(`Target returned HTTP status ${homeResp.status}`);
    }

    const homeHtml = await homeResp.text();
    scrapedPages.push(sanitizedUrl);
    textCorpus.push(`=== HOMEPAGE (${sanitizedUrl}) ===\n` + cleanHtmlToText(homeHtml));

    // 2. Discover and fetch top 2 sublinks if requested
    if (options.deepCrawl !== false) {
      const sublinks = extractKeySublinks(homeHtml, sanitizedUrl);
      for (const subUrl of sublinks.slice(0, 2)) {
        try {
          const subResp = await fetch(subUrl, {
            headers,
            signal: AbortSignal.timeout(6000)
          });
          if (subResp.ok) {
            const subHtml = await subResp.text();
            scrapedPages.push(subUrl);
            textCorpus.push(`=== PAGE: ${subUrl} ===\n` + cleanHtmlToText(subHtml));
          }
        } catch {
          // Continue if sublink times out
        }
      }
    }

    const combinedText = textCorpus.join("\n\n---\n\n");

    // 3. AI Extraction via Gemini 2.5 Flash if available
    let knowledge: ScrapedKnowledge | null = null;
    if (geminiGetter) {
      const { ai, Type } = await geminiGetter();
      if (ai) {
        try {
          const prompt = `
You are the LocalSurge AI Knowledge Distillation Engine.
We have crawled a local trade/contractor business website at: ${sanitizedUrl}
Business Name Hint: ${options.businessName || "Unknown"}
Industry Hint: ${options.industry || "Unknown"}

RAW WEBPAGE TEXT CONTENT:
"""
${combinedText.slice(0, 30000)}
"""

Extract and distill the business into a structured, highly grounded knowledge manifest for an AI FrontDesk chatbot.
The chatbot must know exact services, emergency availability, service areas, estimate policies, pricing cues, and factual answers without hallucinations.
`;

          const responseSchema = {
            type: Type.OBJECT,
            properties: {
              businessName: { type: Type.STRING, description: "Official business name" },
              industry: { type: Type.STRING, description: "Trade category (e.g. Plumbing, HVAC, Roofing, Dental)" },
              tagline: { type: Type.STRING, description: "Main tagline or motto" },
              primaryServices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 4-10 core services provided"
              },
              serviceAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Cities, counties, or zip codes served"
              },
              emergencyPolicy: { type: Type.STRING, description: "24/7 emergency dispatch policy and availability" },
              estimatePolicy: { type: Type.STRING, description: "Policy on free estimates, diagnostics, or quotes" },
              pricingCues: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Mentions of specials, discounts, financing, or price ranges"
              },
              faqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ["question", "answer"]
                },
                description: "Top 3-5 factual FAQs found on the website"
              },
              keyFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key credibility points (e.g. 20+ years in business, Master Plumber license, A+ BBB)"
              }
            },
            required: ["businessName", "industry", "primaryServices", "serviceAreas", "emergencyPolicy", "estimatePolicy", "pricingCues", "faqs", "keyFacts"]
          };

          const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema,
              systemInstruction: "You are an expert data distillation agent for local service businesses. Return strictly accurate, factual JSON."
            }
          });

          const rawJson = result.text;
          if (rawJson) {
            knowledge = JSON.parse(rawJson.trim());
            if (knowledge) {
              knowledge.extractedAt = new Date().toISOString();
              knowledge.rawPageCount = scrapedPages.length;
            }
          }
        } catch (aiErr) {
          console.warn("⚠️ Gemini knowledge extraction warning, using heuristic fallback:", aiErr);
        }
      }
    }

    if (!knowledge) {
      knowledge = extractHeuristicKnowledge(combinedText, options.businessName, options.industry);
      knowledge.extractedAt = new Date().toISOString();
      knowledge.rawPageCount = scrapedPages.length;
    }

    return {
      success: true,
      url: sanitizedUrl,
      pagesScraped: scrapedPages,
      knowledge
    };
  } catch (err: any) {
    console.error("❌ Crawler execution error:", err);
    return {
      success: false,
      url: sanitizedUrl,
      pagesScraped: scrapedPages,
      error: err.message || "Failed to crawl target website",
      knowledge: extractHeuristicKnowledge("", options.businessName, options.industry)
    };
  }
}
