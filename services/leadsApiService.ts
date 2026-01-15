// Recipe Labs Leads API Service
// Connects to the live database via the Recipe Labs Agent API

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:5000';
const BASEROW_API_URL = import.meta.env.VITE_BASEROW_API_URL || 'https://api.baserow.io/api';
const BASEROW_API_KEY = import.meta.env.VITE_BASEROW_API_KEY;
const BASEROW_TABLE_ID = import.meta.env.VITE_BASEROW_TABLE_ID || '789729';

export interface LeadFromAPI {
  id: string | number;
  name: string;
  company?: string;
  category?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  ai_lead_score?: number;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  ai_insights?: string;
  created_at?: string;
}

export interface EmailTracking {
  id: number;
  tracking_id: string;
  recipient: string;
  subject: string;
  company: string;
  sender: string;
  sender_name: string;
  website_url: string;
  sent_at: string;
  opens: string;
  clicks: string;
  opened_at: string | null;
  clicked_at: string | null;
  replied: boolean;
  bounced: boolean;
}

export interface PipelineStats {
  totalLeads: number;
  byStatus: Record<string, number>;
  topCities?: Record<string, number>;
  topCategories?: Record<string, number>;
  topLeads?: LeadFromAPI[];
  recentLeads?: LeadFromAPI[];
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  services: Record<string, string>;
  database: {
    baserow: { totalRecords: number; tableId: string };
    supabase: { totalRecords: number; url: string };
    leadgen: { totalLeads: number; byStatus: Record<string, number>; dbPath: string };
    hubspot: { contacts: number; companies: number; deals: number; configured: boolean };
  };
}

class LeadsApiService {
  private agentUrl: string;
  private baserowUrl: string;
  private baserowKey: string;
  private baserowTableId: string;

  constructor() {
    this.agentUrl = AGENT_API_URL;
    this.baserowUrl = BASEROW_API_URL;
    this.baserowKey = BASEROW_API_KEY || '';
    this.baserowTableId = BASEROW_TABLE_ID;
  }

  // Get health status from the API
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.agentUrl}/health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Get database stats including lead counts
  async getDatabaseStats(): Promise<PipelineStats | null> {
    try {
      const response = await fetch(`${this.agentUrl}/api/v1/database/stats`);
      if (!response.ok) throw new Error('Failed to fetch database stats');
      const data = await response.json();

      return {
        totalLeads: data.leadgen?.totalLeads || 0,
        byStatus: data.leadgen?.byStatus || {},
        topCities: data.leadgen?.stats?.topCities || {},
        topCategories: data.leadgen?.stats?.topCategories || {},
        topLeads: data.leadgen?.topLeads || [],
        recentLeads: data.leadgen?.recentLeads || [],
      };
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
      return null;
    }
  }

  // Search leads in the database
  async searchLeads(query: string): Promise<LeadFromAPI[]> {
    try {
      const response = await fetch(`${this.agentUrl}/api/v1/database/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search leads');
      const data = await response.json();
      return data.leadgen || [];
    } catch (error) {
      console.error('Failed to search leads:', error);
      return [];
    }
  }

  // Get all leads (via health endpoint for now)
  async getLeads(filters?: { limit?: number; status?: string; category?: string }): Promise<LeadFromAPI[]> {
    try {
      // Get stats which includes top/recent leads
      const stats = await this.getDatabaseStats();
      if (!stats) return [];

      // Combine top and recent leads
      const allLeads = [...(stats.topLeads || []), ...(stats.recentLeads || [])];

      // Apply filters if provided
      let filtered = allLeads;
      if (filters?.status) {
        filtered = filtered.filter(l => l.status === filters.status);
      }
      if (filters?.category) {
        filtered = filtered.filter(l => l.category === filters.category);
      }
      if (filters?.limit) {
        filtered = filtered.slice(0, filters.limit);
      }

      return filtered;
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      return [];
    }
  }

  // Get pipeline statistics
  async getPipelineStats(): Promise<PipelineStats | null> {
    return this.getDatabaseStats();
  }

  // ============ BASEROW EMAIL TRACKING ============

  // Get email tracking data from Baserow
  async getEmailTracking(): Promise<EmailTracking[]> {
    if (!this.baserowKey) {
      console.warn('Baserow API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baserowUrl}/database/rows/table/${this.baserowTableId}/?user_field_names=true&size=100`,
        {
          headers: {
            'Authorization': `Token ${this.baserowKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch email tracking');
      const data = await response.json();

      // Filter out empty records
      return (data.results || []).filter((r: EmailTracking) => r.tracking_id && r.recipient);
    } catch (error) {
      console.error('Failed to fetch email tracking:', error);
      return [];
    }
  }

  // Get email tracking stats
  async getEmailStats(): Promise<{
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    openRate: number;
    clickRate: number;
    emails: EmailTracking[];
  }> {
    const emails = await this.getEmailTracking();

    const totalSent = emails.length;
    const totalOpens = emails.reduce((sum, e) => sum + (parseInt(e.opens) || 0), 0);
    const totalClicks = emails.reduce((sum, e) => sum + (parseInt(e.clicks) || 0), 0);
    const openRate = totalSent > 0 ? (emails.filter(e => parseInt(e.opens) > 0).length / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (emails.filter(e => parseInt(e.clicks) > 0).length / totalSent) * 100 : 0;

    return {
      totalSent,
      totalOpens,
      totalClicks,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      emails
    };
  }

  // Create email tracking record in Baserow
  async createEmailTracking(data: Partial<EmailTracking>): Promise<EmailTracking | null> {
    if (!this.baserowKey) {
      console.warn('Baserow API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.baserowUrl}/database/rows/table/${this.baserowTableId}/?user_field_names=true`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${this.baserowKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tracking_id: data.tracking_id || `rl_${Date.now().toString(36)}`,
            recipient: data.recipient,
            subject: data.subject,
            company: data.company,
            sender: data.sender,
            sender_name: data.sender_name,
            website_url: data.website_url,
            sent_at: new Date().toISOString(),
            opens: '0',
            clicks: '0',
            replied: false,
            bounced: false
          })
        }
      );

      if (!response.ok) throw new Error('Failed to create email tracking');
      return await response.json();
    } catch (error) {
      console.error('Failed to create email tracking:', error);
      return null;
    }
  }

  // Update email tracking (e.g., record open/click)
  async updateEmailTracking(id: number, updates: Partial<EmailTracking>): Promise<boolean> {
    if (!this.baserowKey) {
      console.warn('Baserow API key not configured');
      return false;
    }

    try {
      const response = await fetch(
        `${this.baserowUrl}/database/rows/table/${this.baserowTableId}/${id}/?user_field_names=true`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${this.baserowKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to update email tracking:', error);
      return false;
    }
  }

  // ============ CHAT & NOTIFICATIONS ============

  // Chat with the AI agent
  async chat(message: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${this.agentUrl}/api/v1/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      return data.response || 'No response';
    } catch (error) {
      console.error('Chat failed:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  // Send a Slack notification
  async sendSlackNotification(message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.agentUrl}/api/v1/slack/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }
}

export const leadsApiService = new LeadsApiService();
