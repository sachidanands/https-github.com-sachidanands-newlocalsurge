import dns from "dns";
import net from "net";
import type { ScrapedKnowledge, CrawlResult, DetectedForm, DetectedFormField } from "../../src/types/frontdesk";

function isPrivateOrReservedIp(rawIp: string): boolean {
  const ip = String(rawIp || "")
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .split("%")[0];

  if (!ip) return true;

  if (net.isIPv4(ip)) {
    const octets = ip.split(".").map(Number);
    if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
      return true;
    }
    const [a, b, c] = octets;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local / metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 0 && (c === 0 || c === 2)) return true; // 192.0.0.0/24, 192.0.2.0/24
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15
    if (a === 198 && b === 51 && c === 100) return true; // 198.51.100.0/24
    if (a === 203 && b === 0 && c === 113) return true; // 203.0.113.0/24
    if (a >= 224) return true; // Multicast & reserved 224.0.0.0/4
    return false;
  }

  if (net.isIPv6(ip)) {
    if (
      ip === "::" ||
      ip === "::1" ||
      ip === "0:0:0:0:0:0:0:1" ||
      ip === "0:0:0:0:0:0:0:0"
    ) {
      return true;
    }

    // Check IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1 or 0:0:0:0:0:ffff:...)
    const mappedMatch = ip.match(/^(?:::|(?:0{1,4}:){5})ffff:(.+)$/);
    if (mappedMatch) {
      const suffix = mappedMatch[1];
      if (net.isIPv4(suffix)) {
        return isPrivateOrReservedIp(suffix);
      }
      const hexPair = suffix.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
      if (hexPair) {
        const hi = parseInt(hexPair[1], 16);
        const lo = parseInt(hexPair[2], 16);
        const mappedV4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return isPrivateOrReservedIp(mappedV4);
      }
      return true;
    }

    if (/^f[cd][0-9a-f]{2}:/.test(ip)) return true; // fc00::/7 Unique Local
    if (/^fe[89ab][0-9a-f]{1,2}:/.test(ip)) return true; // fe80::/10 Link-Local
    if (ip.startsWith("ff")) return true; // ff00::/8 Multicast
    if (ip.startsWith("2001:db8:")) return true; // Documentation prefix
    return false;
  }

  return true;
}

// SSRF Prevention: Validate that the target URL is a safe, publicly resolvable web domain
export function isSafePublicUrl(inputUrl: string): boolean {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.username || parsed.password) {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    // Block loopback, localhost, internal names, and wildcard DNS reflectors
    if (
      !hostname ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".nip.io") ||
      hostname.endsWith(".sslip.io") ||
      hostname.endsWith(".xip.io")
    ) {
      return false;
    }

    if (net.isIP(hostname) !== 0) {
      return !isPrivateOrReservedIp(hostname);
    }

    // Reject numeric-only/octal/hex hostnames that did not parse cleanly as IPv4
    if (/^[0-9.]+$/.test(hostname)) {
      return false;
    }

    // Require valid top-level or sub-domain structure
    if (!hostname.includes(".")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function assertSafePublicUrl(inputUrl: string): Promise<boolean> {
  if (!isSafePublicUrl(inputUrl)) {
    return false;
  }
  try {
    const parsed = new URL(inputUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (net.isIP(hostname) !== 0) {
      return !isPrivateOrReservedIp(hostname);
    }
    const records = await dns.promises.lookup(hostname, { all: true, verbatim: true });
    return records.length > 0 && records.every((r) => !isPrivateOrReservedIp(r.address));
  } catch {
    return false;
  }
}

async function readBoundedResponseText(resp: Response, maxBytes: number): Promise<string> {
  if (!resp.body || typeof resp.body.getReader !== "function") {
    return (await resp.text()).slice(0, maxBytes);
  }
  const reader = resp.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      const remaining = maxBytes - totalBytes;
      if (remaining <= 0) {
        await reader.cancel();
        break;
      }
      if (value.byteLength > remaining) {
        chunks.push(value.subarray(0, remaining));
        totalBytes += remaining;
        await reader.cancel();
        break;
      }
      chunks.push(value);
      totalBytes += value.byteLength;
    }
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
}

async function safeFetchHtml(
  inputUrl: string,
  headers: Record<string, string>,
  timeoutMs = 12000,
  maxRedirects = 3,
  maxBytes = 1024 * 1024
): Promise<{ html: string; finalUrl: string } | null> {
  let currentUrl = inputUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (!(await assertSafePublicUrl(currentUrl))) {
      return null;
    }

    const resp = await fetch(currentUrl, {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get("location");
      if (!location || hop === maxRedirects) {
        return null;
      }
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!resp.ok) {
      return null;
    }

    const html = await readBoundedResponseText(resp, maxBytes);
    return { html, finalUrl: currentUrl };
  }

  return null;
}

function sanitizeKnowledgeText(val: unknown, maxLen = 280): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function sanitizeScrapedKnowledge(k: ScrapedKnowledge): ScrapedKnowledge {
  return {
    ...k,
    businessName: sanitizeKnowledgeText(k.businessName, 120),
    industry: sanitizeKnowledgeText(k.industry, 100),
    tagline: k.tagline ? sanitizeKnowledgeText(k.tagline, 200) : undefined,
    emergencyPolicy: sanitizeKnowledgeText(k.emergencyPolicy, 300),
    estimatePolicy: sanitizeKnowledgeText(k.estimatePolicy, 300),
    primaryServices: (k.primaryServices || []).map((s) => sanitizeKnowledgeText(s, 140)).filter(Boolean).slice(0, 12),
    serviceAreas: (k.serviceAreas || []).map((a) => sanitizeKnowledgeText(a, 100)).filter(Boolean).slice(0, 20),
    pricingCues: (k.pricingCues || []).map((p) => sanitizeKnowledgeText(p, 180)).filter(Boolean).slice(0, 10),
    faqs: (k.faqs || [])
      .map((f) => ({
        question: sanitizeKnowledgeText(f.question, 180),
        answer: sanitizeKnowledgeText(f.answer, 400)
      }))
      .filter((f) => f.question && f.answer)
      .slice(0, 8),
    keyFacts: (k.keyFacts || []).map((kf) => sanitizeKnowledgeText(kf, 180)).filter(Boolean).slice(0, 10)
  };
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

function parseHtmlAttr(attrs: string, attrName: string): string | undefined {
  if (!attrs) return undefined;
  const re = new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const match = attrs.match(re);
  const val = match ? (match[1] ?? match[2] ?? match[3] ?? "") : "";
  const cleaned = val.replace(/[\x00-\x1F\x7F]/g, "").trim();
  return cleaned || undefined;
}

function escapeCssAttr(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function extractDetectedForms(html: string, pageUrl: string): DetectedForm[] {
  if (!html) return [];
  const results: DetectedForm[] = [];
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let formMatch: RegExpExecArray | null;
  let formIdx = 0;

  while ((formMatch = formRegex.exec(html)) !== null && results.length < 6) {
    formIdx++;
    const formAttrs = formMatch[1] || "";
    const formBody = formMatch[2] || "";
    const action = parseHtmlAttr(formAttrs, "action");
    const method = (parseHtmlAttr(formAttrs, "method") || "POST").toUpperCase();
    const formId = parseHtmlAttr(formAttrs, "id");
    const formClass = parseHtmlAttr(formAttrs, "class");

    if (action && /search/i.test(action) && !/contact|quote|lead/i.test(action)) {
      continue;
    }

    let formSelector = `form:nth-of-type(${formIdx})`;
    if (formId && /^[a-zA-Z0-9_-]+$/.test(formId)) {
      formSelector = `form#${formId}`;
    } else if (action && action.length <= 140 && !action.startsWith("javascript:")) {
      formSelector = `form[action="${escapeCssAttr(action)}"]`;
    } else if (formClass) {
      const firstClass = formClass.split(/\s+/).find((c) => /^[a-zA-Z0-9_-]{2,50}$/.test(c));
      if (firstClass) formSelector = `form.${firstClass}`;
    }

    const hasCaptcha = /g-recaptcha|h-captcha|cf-turnstile|turnstile|recaptcha|altcha|data-sitekey/i.test(formBody);

    const fields: DetectedFormField[] = [];
    const seenKeys = new Set<string>();
    const fieldRegex = /<(input|textarea|select)\b([^>]*)>/gi;
    let fieldMatch: RegExpExecArray | null;

    while ((fieldMatch = fieldRegex.exec(formBody)) !== null && fields.length < 15) {
      const tag = fieldMatch[1].toLowerCase();
      const attrs = fieldMatch[2] || "";
      const type = (parseHtmlAttr(attrs, "type") || (tag === "textarea" ? "textarea" : tag === "select" ? "select" : "text")).toLowerCase();
      if (["hidden", "submit", "button", "reset", "image", "file", "search", "password"].includes(type)) {
        continue;
      }

      const name = parseHtmlAttr(attrs, "name");
      const id = parseHtmlAttr(attrs, "id");
      const placeholder = parseHtmlAttr(attrs, "placeholder") || "";
      const ariaLabel = parseHtmlAttr(attrs, "aria-label") || "";
      const hint = `${name || ""} ${id || ""} ${placeholder} ${ariaLabel}`.toLowerCase();

      if (/honeypot|bot-field|hp_|spam/i.test(hint)) continue;
      if (tag === "input" && name === "s" && fields.length === 0) continue;

      let selector = "";
      if (name && name.length <= 80) {
        selector = `${tag}[name="${escapeCssAttr(name)}"]`;
      } else if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
        selector = `#${id}`;
      } else if (tag === "textarea") {
        selector = "textarea";
      } else {
        selector = `${tag}[type="${escapeCssAttr(type)}"]`;
      }

      let key = name || id || tag;
      if (type === "email" || /email|e-mail/.test(hint)) {
        key = "email";
      } else if (type === "tel" || /phone|tel|mobile|cell/.test(hint)) {
        key = "phone";
      } else if (tag === "textarea" || /message|comment|detail|inquiry|issue|note|desc|how can we help/.test(hint)) {
        key = "message";
      } else if (/full.?name|your.?name|first.?name|\bname\b|fname|cname/.test(hint) && !/company|business|domain|user/.test(hint)) {
        key = "name";
      }

      if (["name", "email", "phone", "message"].includes(key) && seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);

      fields.push({
        key,
        selector,
        name,
        type,
        label: placeholder || ariaLabel || name || key
      });
    }

    const coreCount = fields.filter((f) => ["name", "email", "phone", "message"].includes(f.key)).length;
    if (coreCount === 0 || (fields.length < 2 && !seenKeys.has("email") && !seenKeys.has("phone"))) {
      continue;
    }

    let submitSelector = 'button[type="submit"], input[type="submit"]';
    if (/<button\b[^>]*type=["']?submit/i.test(formBody)) {
      submitSelector = 'button[type="submit"]';
    } else if (/<input\b[^>]*type=["']?submit/i.test(formBody)) {
      submitSelector = 'input[type="submit"]';
    } else if (/<button\b/i.test(formBody)) {
      submitSelector = "button";
    }

    results.push({
      page_url: pageUrl,
      form_selector: formSelector,
      action,
      method,
      has_captcha: hasCaptcha,
      submit_selector: submitSelector,
      fields
    });
  }

  return results;
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
  if (!(await assertSafePublicUrl(sanitizedUrl))) {
    return {
      success: false,
      url: sanitizedUrl,
      pagesScraped: [],
      error: "Invalid or restricted URL. Must be a safe, public HTTP/HTTPS web domain.",
      knowledge: sanitizeScrapedKnowledge(
        extractHeuristicKnowledge("", options.businessName, options.industry)
      )
    };
  }

  const scrapedPages: string[] = [];
  const textCorpus: string[] = [];
  const detectedForms: DetectedForm[] = [];

  try {
    // 1. Fetch Homepage safely (manual redirect validation + private IP check + 1MB limit)
    const headers = {
      "User-Agent": "LocalSurge-FrontDesk-Crawler/1.0 (+https://localsurgeseo.com/ai-frontdesk)",
      "Accept": "text/html,application/xhtml+xml,text/plain"
    };

    const homeResult = await safeFetchHtml(sanitizedUrl, headers, 9000, 3, 1024 * 1024);
    if (!homeResult) {
      throw new Error("Target website could not be reached or failed safety validation.");
    }

    const homeHtml = homeResult.html;
    scrapedPages.push(homeResult.finalUrl);
    textCorpus.push(`=== HOMEPAGE (${homeResult.finalUrl}) ===\n` + cleanHtmlToText(homeHtml));
    detectedForms.push(...extractDetectedForms(homeHtml, homeResult.finalUrl));

    // 2. Discover and fetch top 2 sublinks if requested
    if (options.deepCrawl !== false) {
      const sublinks = extractKeySublinks(homeHtml, homeResult.finalUrl);
      for (const subUrl of sublinks.slice(0, 2)) {
        try {
          const subResult = await safeFetchHtml(subUrl, headers, 6000, 2, 1024 * 1024);
          if (subResult) {
            scrapedPages.push(subResult.finalUrl);
            textCorpus.push(`=== PAGE: ${subResult.finalUrl} ===\n` + cleanHtmlToText(subResult.html));
            detectedForms.push(...extractDetectedForms(subResult.html, subResult.finalUrl));
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

    const dedupedForms: DetectedForm[] = [];
    const seenFormKeys = new Set<string>();
    for (const df of detectedForms) {
      const k = `${df.page_url}::${df.form_selector}`;
      if (!seenFormKeys.has(k)) {
        seenFormKeys.add(k);
        dedupedForms.push(df);
      }
    }

    return {
      success: true,
      url: sanitizedUrl,
      pagesScraped: scrapedPages,
      knowledge: sanitizeScrapedKnowledge(knowledge),
      detectedForms: dedupedForms.slice(0, 6)
    };
  } catch (err: any) {
    console.error("❌ Crawler execution error:", err);
    return {
      success: false,
      url: sanitizedUrl,
      pagesScraped: scrapedPages,
      error: err.message || "Failed to crawl target website",
      knowledge: sanitizeScrapedKnowledge(
        extractHeuristicKnowledge("", options.businessName, options.industry)
      )
    };
  }
}
