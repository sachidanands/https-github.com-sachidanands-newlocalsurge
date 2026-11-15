// WebMCP (Web Model Context Protocol) Specification & Client-Side Runtime
// Open Web Standard enabling AI agents to discover & execute website tools with explicit user consent.

export interface WebMcpToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
  example?: string;
}

export interface WebMcpTool {
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST';
  riskLevel: 'low' | 'medium' | 'high';
  requiresUserConsent: boolean;
  parameters: WebMcpToolParameter[];
  handler?: (params: Record<string, any>) => Promise<any>;
}

// Active tool registry for contextual per-page / per-component tool loading
const activeToolRegistry: Map<string, WebMcpTool> = new Map();

export const WEBMCP_TOOLS: WebMcpTool[] = [
  {
    name: 'audit_local_seo',
    description: 'Executes a comprehensive Local SEO audit evaluating Core Web Vitals, Google Business Profile signals, and local keyword ranking opportunities.',
    endpoint: '/api/webmcp/invoke',
    method: 'POST',
    riskLevel: 'low',
    requiresUserConsent: true,
    parameters: [
      { name: 'url', type: 'string', description: 'Business website URL to audit', required: true, example: 'https://examplecontractor.com' },
      { name: 'niche', type: 'string', description: 'Business niche or trade category', required: true, example: 'Plumbing & Rooter' },
      { name: 'location', type: 'string', description: 'Target city or metropolitan area', required: true, example: 'San Jose, CA' }
    ]
  },
  {
    name: 'scan_nap_citations',
    description: 'Audits local business directory listings (Google Maps, Yelp, Bing Places, YellowPages) for Name-Address-Phone (NAP) consistency.',
    endpoint: '/api/webmcp/invoke',
    method: 'POST',
    riskLevel: 'low',
    requiresUserConsent: true,
    parameters: [
      { name: 'businessName', type: 'string', description: 'Official registered business name', required: true, example: 'Bay Area Contractors' },
      { name: 'phone', type: 'string', description: 'Primary business phone number', required: true, example: '+1 (909) 707-5075' },
      { name: 'zipCode', type: 'string', description: 'Target 5-digit postal zip code', required: true, example: '95112' }
    ]
  },
  {
    name: 'get_plans_and_benefits',
    description: 'Lists all Local Surge SEO plans ($0 Free Trial, $999/mo Starter Boost, $1,999/mo Premium Surge, Custom), including exact deliverables (what users receive upon subscribing), timelines, next action items, and consultative recommendation rules.',
    endpoint: '/api/webmcp/invoke',
    method: 'POST',
    riskLevel: 'low',
    requiresUserConsent: false,
    parameters: [
      { name: 'planId', type: 'string', description: 'Optional filter: single-page, starter, premium, or custom', required: false, example: 'single-page' }
    ]
  },
  {
    name: 'calculate_seo_quote',
    description: 'Evaluates business complexity and website status: proposes $0 Free Trial (starting simple without payment gateways + catchy .com domain suggestions) for simple businesses without a website; inspects existing sites against 2026 standards and proposes Starter Boost ($999/mo) revamp + contract lock-in; proposes Premium Surge ($1,999/mo) for multi-page, blogs, or 3rd-party API integrations.',
    endpoint: '/api/webmcp/invoke',
    method: 'POST',
    riskLevel: 'low',
    requiresUserConsent: false,
    parameters: [
      { name: 'businessName', type: 'string', description: 'Business name for domain suggestions', required: false, example: 'Apex Plumbing' },
      { name: 'industry', type: 'string', description: 'Business niche or trade', required: false, example: 'Plumbing' },
      { name: 'location', type: 'string', description: 'Target city and state', required: false, example: 'San Jose, CA' },
      { name: 'targetLocationCount', type: 'number', description: 'Number of target cities to dominate in map pack', required: true, example: '1' },
      { name: 'hasExistingWebsite', type: 'boolean', description: 'Whether business currently has a live website', required: true, example: 'false' },
      { name: 'website', type: 'string', description: 'Existing website URL to inspect against modern 2026 standards', required: false, example: 'https://apexplumbing.com' },
      { name: 'hasMultiplePagesOrBlog', type: 'boolean', description: 'Requires multiple service pages or monthly SEO blog', required: false, example: 'false' },
      { name: 'needsThirdPartyApiIntegrations', type: 'boolean', description: 'Requires 3rd-party API, CRM, or webhook integrations', required: false, example: 'false' },
      { name: 'needsPaymentGateway', type: 'boolean', description: 'Asked about accepting online payments / checkout', required: false, example: 'false' }
    ]
  },
  {
    name: 'submit_onboarding_lead',
    description: 'Confirms and submits a complete Local SEO onboarding lead directly from AI chat. Emails Strategy Growth Brief PDF and returns full deliverables ("What You Will Get Upon Subscribing") and next action items.',
    endpoint: '/api/webmcp/invoke',
    method: 'POST',
    riskLevel: 'medium',
    requiresUserConsent: true,
    parameters: [
      { name: 'businessName', type: 'string', description: 'Official business name', required: true, example: 'Apex Dental Wellness' },
      { name: 'contactName', type: 'string', description: 'Contact person name', required: true, example: 'Dr. Arthur Miller' },
      { name: 'email', type: 'string', description: 'Business contact email address', required: true, example: 'contact@apexdental.com' },
      { name: 'phone', type: 'string', description: 'Primary phone number', required: true, example: '+1 (909) 707-5075' },
      { name: 'location', type: 'string', description: 'Target city or region', required: true, example: 'San Jose, CA' },
      { name: 'keywords', type: 'string', description: 'Primary target keywords or services', required: true, example: 'emergency dentist, cosmetic dentistry' },
      { name: 'planId', type: 'string', description: 'Target plan ID: single-page, starter, premium, custom, or auto', required: false, example: 'single-page' },
      { name: 'website', type: 'string', description: 'Existing website URL (if any)', required: false, example: 'https://apexdental.com' },
      { name: 'chosenDomain', type: 'string', description: 'Chosen domain name for new $0 website build', required: false, example: 'apexdentalpros.com' },
      { name: 'hasWebsite', type: 'boolean', description: 'Whether the business already has a website', required: false, example: 'false' }
    ]
  }
];

// Initialize base tools into active registry
WEBMCP_TOOLS.forEach(tool => activeToolRegistry.set(tool.name, tool));

// Chrome WebMCP Official API Polyfill: navigator.registerTool & navigator.unregisterTool
export function registerWebMcpTool(name: string, tool: WebMcpTool | any) {
  const toolObj: WebMcpTool = {
    name: name || tool.name,
    description: tool.description || '',
    endpoint: tool.endpoint || '/api/webmcp/invoke',
    method: tool.method || 'POST',
    riskLevel: tool.riskLevel || 'low',
    requiresUserConsent: tool.requiresUserConsent !== false,
    parameters: tool.parameters || [],
    handler: tool.handler
  };

  activeToolRegistry.set(name, toolObj);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('webmcp:tool-registered', { detail: toolObj }));
  }
  return toolObj;
}

export function unregisterWebMcpTool(name: string) {
  activeToolRegistry.delete(name);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('webmcp:tool-unregistered', { detail: { name } }));
  }
}

// Global runtime setup
export function initWebMcpRuntime(onInvokeRequested?: (tool: WebMcpTool, params: Record<string, any>) => void) {
  if (typeof window === 'undefined') return;

  // Polyfill Chrome Native Navigator API (navigator.registerTool / navigator.unregisterTool)
  if (typeof navigator !== 'undefined') {
    (navigator as any).registerTool = (name: string, tool: any) => registerWebMcpTool(name, tool);
    (navigator as any).unregisterTool = (name: string) => unregisterWebMcpTool(name);
  }

  const webMcpObject = {
    version: '1.0.0',
    protocol: 'WebModelContextProtocol',
    tools: Array.from(activeToolRegistry.values()),
    getTools: () => Array.from(activeToolRegistry.values()),
    registerTool: (name: string, tool: any) => registerWebMcpTool(name, tool),
    unregisterTool: (name: string) => unregisterWebMcpTool(name),
    invokeTool: async (toolName: string, params: Record<string, any>) => {
      const tool = activeToolRegistry.get(toolName) || WEBMCP_TOOLS.find(t => t.name === toolName);
      if (!tool) {
        throw new Error(`WebMCP Tool "${toolName}" not found in active context.`);
      }

      if (tool.requiresUserConsent && onInvokeRequested) {
        onInvokeRequested(tool, params);
        return { status: 'pending_user_consent', message: 'Awaiting explicit user consent prompt approval.' };
      }

      if (tool.handler) {
        return await tool.handler(params);
      }

      return await executeWebMcpTool(tool, params);
    }
  };

  (window as any).webmcp = webMcpObject;
}

export async function executeWebMcpTool(tool: WebMcpTool, params: Record<string, any>) {
  try {
    const response = await fetch(tool.endpoint, {
      method: tool.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolName: tool.name, params })
    });

    if (!response.ok) {
      throw new Error(`WebMCP invocation error: ${response.statusText}`);
    }

    const json = await response.json();

    // Trigger custom agentInvoked event for DOM form feedback
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('agentInvoked', {
        detail: { toolName: tool.name, params, result: json }
      }));
    }

    return json;
  } catch (err: any) {
    return { success: false, error: err.message || 'WebMCP Tool execution failed.' };
  }
}
