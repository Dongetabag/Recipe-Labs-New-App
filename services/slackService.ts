// Recipe Labs Slack Notification Service
// Sends notifications to Slack via backend API

const API_BASE = import.meta.env.VITE_AGENT_API_URL || 'https://app.madebyrecipe.com';

interface SlackNotificationResult {
  success: boolean;
  error?: string;
}

export type SlackChannel =
  | 'SIGNUPS'
  | 'DESIGN'
  | 'VIDEO'
  | 'AGENT_CHAT'
  | 'AI_EXECUTIVE'
  | 'EMAIL'
  | 'LEADS'
  | 'WORKFLOWS'
  | 'DATA_SYNC'
  | 'CAMPAIGNS'
  | 'TEAM'
  | 'SYSTEM';

class SlackService {
  private apiUrl: string;

  constructor(apiUrl: string = API_BASE) {
    this.apiUrl = apiUrl;
  }

  private async post(endpoint: string, data: any): Promise<SlackNotificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('[Slack] Notification failed:', error);
      return { success: false, error: String(error) };
    }
  }

  // Signup & Auth
  async notifySignup(user: { name?: string; email?: string; role?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/signup', { user });
  }

  async notifyLogin(user: { name?: string; email?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/login', { user });
  }

  // Design notifications
  async notifyDesignComplete(data: { user?: string; type?: string; duration?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/design/complete', data);
  }

  // Video notifications
  async notifyVideoComplete(data: { user?: string; title?: string; duration?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/video/complete', data);
  }

  // AI Agent notifications
  async notifyAgentChat(data: { user?: string; query?: string; response?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/agent/chat', data);
  }

  // Email notifications
  async notifyEmailSent(data: { campaignName?: string; recipientCount?: number; subject?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/email/sent', data);
  }

  async notifyEmailOpen(data: { contactName?: string; email?: string; company?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/email/open', data);
  }

  async notifyEmailClick(data: { contactName?: string; email?: string; linkUrl?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/email/click', data);
  }

  // Lead notifications
  async notifyNewLead(lead: { company?: string; name?: string; email?: string; category?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/lead/new', lead);
  }

  async notifyQualifiedLead(lead: { company?: string; name?: string; score?: number }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/lead/qualified', lead);
  }

  async notifyHighScoreLead(lead: { company?: string; name?: string; score?: number; phone?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/lead/high-score', lead);
  }

  async notifyLeadConverted(lead: { company?: string; name?: string; dealValue?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/lead/converted', lead);
  }

  // Workflow notifications
  async notifyWorkflowComplete(data: { workflowName: string; duration?: string; itemsProcessed?: number }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/workflow/complete', data);
  }

  async notifyWorkflowFailed(data: { workflowName: string; error?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/workflow/failed', data);
  }

  // Data sync notifications
  async notifyDataSync(data: { source: string; recordCount?: number; created?: number; updated?: number }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/data/sync', data);
  }

  // Campaign notifications
  async notifyCampaignLaunched(data: { name: string; audienceSize?: number }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/campaign/launched', data);
  }

  // System notifications
  async notifySystemError(data: { service?: string; error?: string; severity?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/system/error', data);
  }

  async notifyDeployment(data: { app?: string; version?: string; deployedBy?: string }): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/system/deployment', data);
  }

  // Custom message
  async sendCustom(channel: SlackChannel, title: string, message: string, fields?: { label: string; value: string }[]): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/notify/custom', { channel, title, message, fields });
  }

  // Direct message to channel (simple)
  async sendMessage(message: string, channel?: string): Promise<SlackNotificationResult> {
    return this.post('/api/v1/slack/send', { message, channel });
  }
}

export const slackService = new SlackService();
export default slackService;
