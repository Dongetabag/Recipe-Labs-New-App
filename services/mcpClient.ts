// MCP Client Service for Recipe Labs
// Connects to multiple MCP servers: recipe-labs-mcp (media tools) and aisim-mcp (AI skills)

const MCP_BASE_URL = import.meta.env.VITE_MCP_URL || 'https://mcp.srv1167160.hstgr.cloud';
const AISIM_MCP_URL = import.meta.env.VITE_AISIM_MCP_URL || 'https://mcp.elevenviews.io';
const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'https://app.madebyrecipe.com';
const MEDIA_MCP_URL = 'http://172.18.0.19:3200'; // Internal recipe-labs-mcp

export interface MCPTool {
  name: string;
  description: string;
  endpoint?: string;
  server?: 'recipe-labs' | 'aisim';
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  toolName: string;
  timestamp: string;
}

export interface LeadData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  category?: string;
  city?: string;
  status?: string;
  score?: number;
}

export interface VideoCreateOptions {
  title: string;
  scenes?: { text: string; duration?: number; imageUrl?: string }[];
  voiceover?: boolean;
  style?: string;
}

class MCPClient {
  private baseUrl: string;
  private aisimUrl: string;
  private agentUrl: string;
  private tools: MCPTool[] = [];
  private isConnected: boolean = false;

  constructor() {
    this.baseUrl = MCP_BASE_URL;
    this.aisimUrl = AISIM_MCP_URL;
    this.agentUrl = AGENT_API_URL;
  }

  // Initialize connection and fetch available tools
  async connect(): Promise<{ success: boolean; tools: MCPTool[] }> {
    try {
      // Try to connect to MCP server
      const healthCheck = await fetch(`${this.agentUrl}/health`).catch(() => null);
      this.isConnected = healthCheck?.ok || true; // Assume connected for now

      // Fetch tool definitions from all servers
      this.tools = await this.getToolDefinitions();

      return { success: true, tools: this.tools };
    } catch (error) {
      console.error('MCP connection failed:', error);
      this.isConnected = false;
      return { success: false, tools: [] };
    }
  }

  // Get available tool definitions from all MCP servers
  private async getToolDefinitions(): Promise<MCPTool[]> {
    const tools: MCPTool[] = [
      // ============ RECIPE LABS CORE TOOLS ============
      {
        name: 'recipe_labs_health',
        description: 'Check the health status of Recipe Labs API and all connected services',
        server: 'recipe-labs',
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'recipe_labs_get_leads',
        description: 'Get leads from the database with optional filters',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by business category' },
            city: { type: 'string', description: 'Filter by city' },
            status: { type: 'string', description: 'Filter by status (new, contacted, qualified)' },
            limit: { type: 'number', description: 'Max leads to return' }
          },
          required: []
        }
      },
      {
        name: 'recipe_labs_pipeline_stats',
        description: 'Get pipeline analytics and statistics',
        server: 'recipe-labs',
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'recipe_labs_send_slack',
        description: 'Send a message to the Recipe Labs Slack channel',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Message to send to Slack' },
            channel: { type: 'string', description: 'Slack channel (optional)' }
          },
          required: ['message']
        }
      },
      {
        name: 'recipe_labs_create_lead',
        description: 'Create a new lead in the database',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Business or contact name' },
            company: { type: 'string', description: 'Company name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' },
            category: { type: 'string', description: 'Business category' },
            city: { type: 'string', description: 'City location' }
          },
          required: ['name']
        }
      },
      {
        name: 'recipe_labs_chat',
        description: 'Chat with the AI agent for insights about leads and business data',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Question or query' }
          },
          required: ['message']
        }
      },

      // ============ MEDIA TOOLS (recipe-labs-mcp) ============
      {
        name: 'validate_email',
        description: 'Validate a single email address',
        endpoint: 'POST /email/validate',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email address to validate' }
          },
          required: ['email']
        }
      },
      {
        name: 'validate_email_batch',
        description: 'Validate multiple email addresses',
        endpoint: 'POST /email/validate/batch',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            emails: { type: 'array', description: 'Array of email addresses' }
          },
          required: ['emails']
        }
      },
      {
        name: 'resize_image',
        description: 'Resize image to specific platform dimensions',
        endpoint: 'POST /social/resize',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            imageUrl: { type: 'string', description: 'URL of image to resize' },
            platform: { type: 'string', description: 'Target platform (instagram, facebook, twitter, linkedin)' },
            dimensions: { type: 'object', description: 'Custom dimensions {width, height}' }
          },
          required: ['imageUrl']
        }
      },
      {
        name: 'scrape_media',
        description: 'Scrape images and videos from any website URL',
        endpoint: 'POST /scraper/scrape',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to scrape' }
          },
          required: ['url']
        }
      },
      {
        name: 'create_video',
        description: 'Create a custom video with scenes, images, text, and voiceover',
        endpoint: 'POST /video/create',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Video title' },
            scenes: { type: 'array', description: 'Array of scene objects' },
            voiceover: { type: 'boolean', description: 'Enable AI voiceover' }
          },
          required: ['title']
        }
      },
      {
        name: 'text_to_video',
        description: 'Create a video from text with AI voiceover',
        endpoint: 'POST /video/text-to-video',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text content for the video' },
            style: { type: 'string', description: 'Visual style' }
          },
          required: ['text']
        }
      },
      {
        name: 'social_short_video',
        description: 'Create social media short videos (Instagram, TikTok, YouTube)',
        endpoint: 'POST /video/social-short',
        server: 'recipe-labs',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Video content/script' },
            platform: { type: 'string', description: 'Target platform' },
            duration: { type: 'number', description: 'Target duration in seconds' }
          },
          required: ['content']
        }
      },

      // ============ AISIM AI SKILLS ============
      {
        name: 'revenue_automation_orchestrator',
        description: 'AI skill for automating revenue operations and workflows',
        server: 'aisim',
        inputSchema: {
          type: 'object',
          properties: {
            task: { type: 'string', description: 'Revenue automation task' },
            context: { type: 'object', description: 'Business context' }
          },
          required: ['task']
        }
      },
      {
        name: 'content_empire_builder',
        description: 'AI skill for content creation and strategy',
        server: 'aisim',
        inputSchema: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'Content topic' },
            format: { type: 'string', description: 'Content format (blog, social, email)' },
            tone: { type: 'string', description: 'Content tone' }
          },
          required: ['topic']
        }
      },
      {
        name: 'business_genesis_engine',
        description: 'AI skill for business idea generation and validation',
        server: 'aisim',
        inputSchema: {
          type: 'object',
          properties: {
            industry: { type: 'string', description: 'Target industry' },
            problem: { type: 'string', description: 'Problem to solve' }
          },
          required: ['industry']
        }
      },
      {
        name: 'client_intelligence_synthesizer',
        description: 'AI skill for client research and intelligence gathering',
        server: 'aisim',
        inputSchema: {
          type: 'object',
          properties: {
            company: { type: 'string', description: 'Company to research' },
            depth: { type: 'string', description: 'Research depth (quick, standard, deep)' }
          },
          required: ['company']
        }
      },
      {
        name: 'visual_audit_engine',
        description: 'AI skill for visual/design audits and analysis',
        server: 'aisim',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to audit' },
            focus: { type: 'string', description: 'Audit focus (UX, branding, conversion)' }
          },
          required: ['url']
        }
      },
      {
        name: 'conversion_optimizer',
        description: 'AI skill for conversion rate optimization',
        server: 'aisim',
        inputSchema: {
          type: 'object',
          properties: {
            pageUrl: { type: 'string', description: 'Page URL to optimize' },
            goal: { type: 'string', description: 'Conversion goal' }
          },
          required: ['pageUrl']
        }
      }
    ];

    return tools;
  }

  // Execute an MCP tool
  async executeTool(toolName: string, args: Record<string, any> = {}): Promise<MCPToolResult> {
    const tool = this.tools.find(t => t.name === toolName);

    try {
      let response: Response;

      // Route to appropriate server
      if (tool?.server === 'aisim') {
        // AiSim MCP uses SSE/message pattern
        response = await fetch(`${this.aisimUrl}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: toolName,
            arguments: args
          })
        });
      } else if (tool?.endpoint) {
        // Media tools use direct REST endpoints
        const [method, path] = tool.endpoint.split(' ');
        response = await fetch(`${MEDIA_MCP_URL}${path}`, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
      } else {
        // Default Recipe Labs tools via agent API
        response = await fetch(`${this.agentUrl}/api/v1/mcp/tools/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: toolName, arguments: args })
        });
      }

      const data = await response.json();

      return {
        success: response.ok && !data.error,
        data: data.result || data.content || data,
        error: data.error,
        toolName,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        toolName,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============ CONVENIENCE METHODS ============

  // Send message to Slack
  async sendSlackMessage(message: string, channel?: string): Promise<MCPToolResult> {
    return this.executeTool('recipe_labs_send_slack', { message, channel });
  }

  // Get leads from database
  async getLeads(filters: { category?: string; city?: string; status?: string; limit?: number } = {}): Promise<MCPToolResult> {
    return this.executeTool('recipe_labs_get_leads', filters);
  }

  // Get pipeline statistics
  async getPipelineStats(): Promise<MCPToolResult> {
    return this.executeTool('recipe_labs_pipeline_stats', {});
  }

  // Create a new lead
  async createLead(lead: LeadData): Promise<MCPToolResult> {
    return this.executeTool('recipe_labs_create_lead', lead);
  }

  // Chat with AI agent
  async chat(message: string): Promise<MCPToolResult> {
    return this.executeTool('recipe_labs_chat', { message });
  }

  // Check health
  async checkHealth(): Promise<MCPToolResult> {
    return this.executeTool('recipe_labs_health', {});
  }

  // Validate email
  async validateEmail(email: string): Promise<MCPToolResult> {
    return this.executeTool('validate_email', { email });
  }

  // Validate batch emails
  async validateEmails(emails: string[]): Promise<MCPToolResult> {
    return this.executeTool('validate_email_batch', { emails });
  }

  // Resize image for social media
  async resizeImage(imageUrl: string, platform?: string, dimensions?: { width: number; height: number }): Promise<MCPToolResult> {
    return this.executeTool('resize_image', { imageUrl, platform, dimensions });
  }

  // Scrape media from URL
  async scrapeMedia(url: string): Promise<MCPToolResult> {
    return this.executeTool('scrape_media', { url });
  }

  // Create video
  async createVideo(options: VideoCreateOptions): Promise<MCPToolResult> {
    return this.executeTool('create_video', options);
  }

  // Text to video
  async textToVideo(text: string, style?: string): Promise<MCPToolResult> {
    return this.executeTool('text_to_video', { text, style });
  }

  // Create social short video
  async createSocialShort(content: string, platform?: string, duration?: number): Promise<MCPToolResult> {
    return this.executeTool('social_short_video', { content, platform, duration });
  }

  // AI Skills - Content Builder
  async buildContent(topic: string, format?: string, tone?: string): Promise<MCPToolResult> {
    return this.executeTool('content_empire_builder', { topic, format, tone });
  }

  // AI Skills - Client Intelligence
  async researchClient(company: string, depth?: string): Promise<MCPToolResult> {
    return this.executeTool('client_intelligence_synthesizer', { company, depth });
  }

  // AI Skills - Visual Audit
  async auditVisual(url: string, focus?: string): Promise<MCPToolResult> {
    return this.executeTool('visual_audit_engine', { url, focus });
  }

  // AI Skills - Conversion Optimizer
  async optimizeConversion(pageUrl: string, goal?: string): Promise<MCPToolResult> {
    return this.executeTool('conversion_optimizer', { pageUrl, goal });
  }

  // Get connection status
  getStatus(): { connected: boolean; tools: MCPTool[]; baseUrl: string } {
    return {
      connected: this.isConnected,
      tools: this.tools,
      baseUrl: this.baseUrl
    };
  }

  // Get available tools
  getTools(): MCPTool[] {
    return this.tools;
  }

  // Get tools by server
  getToolsByServer(server: 'recipe-labs' | 'aisim'): MCPTool[] {
    return this.tools.filter(t => t.server === server);
  }
}

// Singleton instance
export const mcpClient = new MCPClient();

// Auto-connect on import
mcpClient.connect().then(result => {
  if (result.success) {
    console.log('[MCP] Connected with', result.tools.length, 'tools available');
  } else {
    console.warn('[MCP] Failed to connect to server');
  }
});

export default mcpClient;
