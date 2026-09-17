import type {
  FrontdeskSite,
  ChatMessage,
  FrontdeskLead,
  QualificationSummary,
  LeadUrgency,
  ScrapedKnowledge
} from "../../src/types/frontdesk";

/**
 * Builds the comprehensive system instruction for Gemini 2.5 Flash
 * tailored to the contractor's trade, scraped knowledge, and active feature flags.
 */
export function buildFrontdeskSystemPrompt(site: FrontdeskSite): string {
  const k: Partial<ScrapedKnowledge> = site.scraped_knowledge || {};
  const flags = site.feature_flags || {
    enablePhotoUpload: true,
    enableEmailDispatch: true,
    enableSmsDispatch: false,
    enablePhoneCallback: true,
    enableEmergencyBanner: true,
    enableDirectBooking: false,
    enableCustomBranding: false,
    planTier: "starter"
  };

  const servicesList = (k.primaryServices && k.primaryServices.length > 0)
    ? k.primaryServices.map((s: string) => `• ${s}`).join("\n")
    : `• Emergency Diagnostics & Repair\n• Full Replacement & Installation\n• Preventative Maintenance`;

  const serviceAreasList = (k.serviceAreas && k.serviceAreas.length > 0)
    ? k.serviceAreas.join(", ")
    : (site.service_radius?.city || "Local Metro Area");

  const pricingList = (k.pricingCues && k.pricingCues.length > 0)
    ? k.pricingCues.map((p: string) => `• ${p}`).join("\n")
    : `• Upfront flat-rate pricing before work begins\n• Free estimates on qualifying full replacements`;

  const faqsList = (k.faqs && k.faqs.length > 0)
    ? k.faqs.map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
    : "";

  const keyFactsList = (k.keyFacts && k.keyFacts.length > 0)
    ? k.keyFacts.map((kf: string) => `• ${kf}`).join("\n")
    : `• Licensed, bonded, and insured\n• 100% Satisfaction Guarantee`;

  return `
You are "SurgeBot", the 24/7 AI FrontDesk Dispatcher & Estimator for "${site.business_name}".
Industry / Trade: ${site.industry.toUpperCase()}
Location / Primary City: ${site.service_radius?.city || "Local Area"} (Service Radius: ${site.service_radius?.radiusMiles || 25} miles)
Hotline: ${site.phone || "Available upon request"} | 24/7 Emergency Line: ${site.emergency_phone || site.phone || "Available 24/7"}
Estimate Policy: ${site.estimate_policy}
Working Hours: Weekday: ${site.working_hours?.weekday || "7am-7pm"} | Weekend: ${site.working_hours?.weekend || "8am-5pm"} | 24/7 Emergency: ${site.working_hours?.emergency247 ? "YES" : "NO"}

==================================================
CONTRACTOR KNOWLEDGE & VERIFIED FACTS:
==================================================
SERVICES OFFERED:
${servicesList}

PRIMARY SERVICE AREAS:
${serviceAreasList}
Operational Zip Codes: ${(site.service_radius?.zipCodes || []).join(", ") || "All metro zip codes within radius"}

SPECIAL PRICING & PROMOTIONS:
${pricingList}

VERIFIED CREDENTIALS:
${keyFactsList}

COMMON FAQS:
${faqsList}

${site.custom_instructions ? `SPECIAL CONTRACTOR INSTRUCTIONS:\n${site.custom_instructions}\n` : ""}

==================================================
FEATURE CONFIGURATION & MODULAR ADD-ONS:
==================================================
• Plan Tier: ${flags.planTier || "starter"}
• Photo & Image Analysis: ${flags.enablePhotoUpload ? "ENABLED. If homeowner mentions visible damage, leaks, or equipment models, actively encourage them to snap/upload a photo." : "DISABLED. Do NOT ask for photo uploads."}
• 5-Minute Phone Callback: ${flags.enablePhoneCallback ? "ENABLED. Offer an immediate 5-minute phone callback from on-duty dispatch." : "DISABLED. Offer standard business scheduling."}

==================================================
COMMUNICATION BEHAVIOR & CONVERSATIONAL TRIAGE:
==================================================
1. TONE: Warm, confident, reassuring, and highly knowledgeable trade professional. Speak like an experienced dispatcher who genuinely cares about solving their home problem fast.
2. NO HALLUCINATIONS: Stick strictly to the services, pricing, and policies above. If asked for exact repair pricing on complex jobs, explain that an on-site technician must inspect the issue, but mention the estimate policy (${site.estimate_policy}).
3. CONVERSATIONAL LEAD QUALIFICATION & WEBMCP SUBMISSION:
   - Answer their immediate question first with grounded facts.
   - Actively and conversationally collect the customer's: 1) What specific service or repair they need, 2) Their Service Zip Code or Address, 3) Customer Name, 4) Best Contact Phone Number or Email.
   - Reassure the customer: "I can submit this service ticket directly to our on-duty team on your behalf right now so you don't have to fill out any forms!"
   - Once contact details are gathered, confirm to the customer that their lead has been officially logged with dispatch and an emergency/on-duty specialist is reviewing their request.
4. EMERGENCY SAFETY DIRECTIVES:
   - Water Leaks / Burst Pipes: Advise immediate shutoff of the main water supply valve to prevent property damage, then grab phone & address.
   - Gas Smell: Advise immediate evacuation and calling 911 / utility.
   - Electrical Sparks / Outlets: Advise keeping away and shutting main breaker if safe.
   - Active Roof Leaks: Advise placing a bucket and tarping if safe, confirm emergency tarping crew dispatch.
5. OUT-OF-SERVICE-AREA HANDLING:
   - If the customer's zip code/city is clearly outside ${serviceAreasList}, state politely that they are outside the standard coverage area, but offer to take their details so the manager can review if extended dispatch is possible.
6. MULTIMODAL PHOTO INSPECTION:
   - If the user provides an image, examine the visual details (e.g. identify pipe fittings, water staining, shingle missing, furnace flame, AC coil) and comment directly on what you observe to reassure the homeowner.
7. BREVITY: Keep chat replies concise (2-4 sentences max per response) so it feels like a rapid live messenger conversation on mobile.
`;
}

/**
 * Converts chat message history into Gemini API Content parts
 */
export function formatGeminiContents(messages: ChatMessage[]) {
  return messages.map((msg) => {
    const parts: any[] = [];

    if (msg.imageUrl) {
      if (msg.imageUrl.startsWith("data:")) {
        const match = msg.imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      }
    }

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts
    };
  });
}

/**
 * Secondary fallback: Stream from OpenAI or Groq API if keys are configured
 */
export async function* streamOpenAiCompatible(
  systemInstruction: string,
  messages: ChatMessage[],
  apiKey: string,
  apiUrl: string = "https://api.openai.com/v1/chat/completions",
  model: string = "gpt-4o-mini"
): AsyncGenerator<string, void, unknown> {
  const formattedMessages = [
    { role: "system", content: systemInstruction },
    ...messages.map((m) => {
      if (m.imageUrl && m.imageUrl.startsWith("data:")) {
        return {
          role: m.role === "assistant" ? "assistant" : "user",
          content: [
            { type: "text", text: m.content || "Uploaded photo:" },
            { type: "image_url", image_url: { url: m.imageUrl } }
          ]
        };
      }
      return {
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      };
    })
  ];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature: 0.3,
      stream: true
    }),
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok || !response.body) {
    throw new Error(`Secondary provider error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (trimmed.startsWith("data: ")) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {}
      }
    }
  }
}

/**
 * Multi-Provider Cascade:
 * 1. Gemini 2.5 Flash -> 2. Groq / OpenAI -> 3. Local Deterministic Rule Engine
 */
export async function* streamMultiProviderChat(
  site: FrontdeskSite,
  messages: ChatMessage[],
  geminiGetter: () => Promise<{ ai: any; Type: any }>
): AsyncGenerator<string, void, unknown> {
  const systemInstruction = buildFrontdeskSystemPrompt(site);

  // 1. Attempt Primary: Gemini 2.5 Flash
  try {
    const { ai } = await geminiGetter();
    if (ai) {
      const contents = formatGeminiContents(messages);
      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 500
        }
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
      return;
    }
  } catch (geminiErr: any) {
    console.warn("⚠️ [Cascade Tier 1: Gemini] unavailable:", geminiErr?.message || geminiErr);
  }

  // 2. Attempt Secondary: Groq or OpenAI if keys are present
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log("🟢 [Cascade Tier 2: Groq] Failover engaged...");
      for await (const token of streamOpenAiCompatible(
        systemInstruction,
        messages,
        groqKey,
        "https://api.groq.com/openai/v1/chat/completions",
        "llama-3.3-70b-versatile"
      )) {
        yield token;
      }
      return;
    } catch (groqErr) {
      console.warn("⚠️ [Cascade Tier 2: Groq] failed:", groqErr);
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      console.log("🟢 [Cascade Tier 2: OpenAI] Failover engaged...");
      for await (const token of streamOpenAiCompatible(
        systemInstruction,
        messages,
        openaiKey,
        "https://api.openai.com/v1/chat/completions",
        "gpt-4o-mini"
      )) {
        yield token;
      }
      return;
    } catch (openaiErr) {
      console.warn("⚠️ [Cascade Tier 2: OpenAI] failed:", openaiErr);
    }
  }

  // 3. Final Fallback: Local Deterministic Rule Engine
  console.log("🟢 [Cascade Tier 3: Local Rule Engine] Active.");
  for await (const token of generateFallbackStream(site, messages)) {
    yield token;
  }
}

/**
 * Extracts structured lead details from conversation using regex/heuristics or Gemini
 */
export function extractLeadEntitiesFromText(
  transcript: ChatMessage[],
  site: FrontdeskSite
): {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceAddress?: string;
  issueDescription?: string;
  urgency: LeadUrgency;
  isInsideServiceArea: boolean;
  isComplete: boolean;
} {
  const fullUserText = transcript
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  // 1. Phone number extraction
  const phoneMatch = fullUserText.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  const customerPhone = phoneMatch ? phoneMatch[0].trim() : undefined;

  // 2. Email extraction
  const emailMatch = fullUserText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const customerEmail = emailMatch ? emailMatch[0].trim() : undefined;

  // 3. Name extraction heuristic (e.g. "I'm Sarah", "My name is John Smith", "This is Dave")
  let customerName: string | undefined = undefined;
  const nameMatch = fullUserText.match(/(?:my name is|i am|i'm|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) {
    customerName = nameMatch[1].trim();
  }

  // 4. Address / Zip extraction
  let serviceAddress: string | undefined = undefined;
  const zipMatch = fullUserText.match(/\b\d{5}\b/);
  const streetMatch = fullUserText.match(/\b\d{1,5}\s+[A-Za-z0-9\s.,]+(?:St|Street|Rd|Road|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/i);
  if (streetMatch) {
    serviceAddress = streetMatch[0].trim() + (zipMatch ? ` ${zipMatch[0]}` : "");
  } else if (zipMatch) {
    serviceAddress = `Zip Code ${zipMatch[0]}`;
  }

  // 5. Urgency classification
  let urgency: LeadUrgency = "standard";
  const emergencyKeywords = /burst|flooding|gushing|fire|smoke|gas|spark|freeze|carbon monoxide|no heat in winter|ceiling cave|overflow/i;
  const urgentKeywords = /leak|urgent|asap|today|warm air|broken|backup|clogged|dripping|no hot water/i;

  if (emergencyKeywords.test(fullUserText)) {
    urgency = "emergency";
  } else if (urgentKeywords.test(fullUserText)) {
    urgency = "urgent";
  }

  // 6. Service area check
  let isInsideServiceArea = true;
  if (zipMatch && site.service_radius?.zipCodes && site.service_radius.zipCodes.length > 0) {
    isInsideServiceArea = site.service_radius.zipCodes.includes(zipMatch[0]);
  }

  const isComplete = Boolean(customerPhone || customerEmail);

  return {
    customerName,
    customerPhone,
    customerEmail,
    serviceAddress,
    issueDescription: fullUserText.slice(0, 300),
    urgency,
    isInsideServiceArea,
    isComplete
  };
}

/**
 * Fallback streaming response generator for offline / local testing without API keys
 */
export async function* generateFallbackStream(
  site: FrontdeskSite,
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const flags = site.feature_flags;

  let response = "";

  if (/burst|flooding|gushing|leak|water heater/i.test(lastMsg)) {
    response = `🚨 This sounds urgent! If water is actively leaking, please turn off your main water shutoff valve immediately to prevent damage. We have on-duty technicians ready in ${site.service_radius?.city || "your area"}. What is your address and phone number so dispatch can confirm arrival time?`;
  } else if (/cost|price|estimate|quote|how much/i.test(lastMsg)) {
    response = `We provide ${site.estimate_policy.toLowerCase()} For standard service calls, our technicians provide upfront flat-rate pricing before starting any work. What service do you need, and what is your zip code?`;
  } else if (/hours|open|weekend/i.test(lastMsg)) {
    response = `Our standard hours are ${site.working_hours?.weekday || "Mon-Fri 7am-7pm"}, and ${site.working_hours?.emergency247 ? "our emergency dispatch team is available 24/7/365" : "weekend service is available"}. How can we assist you today?`;
  } else if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(lastMsg) || /@/.test(lastMsg)) {
    response = `Thank you! I have recorded your contact details. Our dispatch team has been notified and will call you ${flags?.enablePhoneCallback !== false ? "within 5 minutes" : "promptly"} to confirm your appointment!`;
  } else {
    response = `Thanks for reaching out to ${site.business_name}! We specialize in ${(site.scraped_knowledge?.primaryServices || []).slice(0, 3).join(", ") || "professional local service"}. Let me know what issue you are experiencing or share your phone number for fast scheduling!`;
  }

  // Simulate token chunks
  const words = response.split(" ");
  for (let i = 0; i < words.length; i++) {
    yield words[i] + (i < words.length - 1 ? " " : "");
    await new Promise((r) => setTimeout(r, 20)); // Smooth typing effect
  }
}
