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
}

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
      { name: 'phone', type: 'string', description: 'Primary business phone number', required: true, example: '+1 (909) 757-6469' },
      { name: 'zipCode', type: 'string', description: 'Target 5-digit postal zip code', required: true, example: '95112' }
    ]
  },
  {
    name: 'calculate_seo_quote',
    description: 'Calculates custom monthly Local SEO pricing tier recommendations and deliverable scopes based on business goals.',
    endpoint: '/api/webmcp/invoke',
    method: 'POST',
    riskLevel: 'low',
    requiresUserConsent: true,
    parameters: [
      { name: 'targetLocationCount', type: 'number', description: 'Number of target cities to dominate in map pack', required: true, example: '3' },
      { name: 'hasExistingWebsite', type: 'boolean', description: 'Whether business currently has a live website', required: true, example: 'true' }
    ]
  },
  {
    name: 'submit_onboarding_lead',
    description: 'Submits a complete Local SEO strategy onboarding request to receive a custom ranking roadmap and domain allocation.',
    endpoint: '/api/webmcp/invoke',
    method: 'POST',
    riskLevel: 'medium',
    requiresUserConsent: true,
    parameters: [
      { name: 'businessName', type: 'string', description: 'Official business name', required: true, example: 'Apex Dental Wellness' },
      { name: 'contactName', type: 'string', description: 'Contact person name', required: true, example: 'Dr. Arthur Miller' },
      { name: 'email', type: 'string', description: 'Business contact email address', required: true, example: 'contact@apexdental.com' },
      { name: 'phone', type: 'string', description: 'Primary phone number', required: true, example: '+1 (909) 757-6469' },
      { name: 'location', type: 'string', description: 'Target city or region', required: true, example: 'San Jose, CA' },
      { name: 'keywords', type: 'string', description: 'Primary target keywords or services', required: true, example: 'emergency dentist, cosmetic dentistry' }
    ]
  }
];

// Initialize global window.webmcp runtime for browser AI assistants
export function initWebMcpRuntime(onInvokeRequested?: (tool: WebMcpTool, params: Record<string, any>) => void) {
  if (typeof window === 'undefined') return;

  const webMcpObject = {
    version: '1.0.0',
    protocol: 'WebModelContextProtocol',
    tools: WEBMCP_TOOLS,
    getTools: () => WEBMCP_TOOLS,
    invokeTool: async (toolName: string, params: Record<string, any>) => {
      const tool = WEBMCP_TOOLS.find(t => t.name === toolName);
      if (!tool) {
        throw new Error(`WebMCP Tool "${toolName}" not found.`);
      }

      if (tool.requiresUserConsent && onInvokeRequested) {
        onInvokeRequested(tool, params);
        return { status: 'pending_user_consent', message: 'Awaiting explicit user consent prompt approval.' };
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

    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'WebMCP Tool execution failed.' };
  }
}
