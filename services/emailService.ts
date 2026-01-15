// Recipe Labs Email Service
// Handles email sending via n8n workflows

import { n8nService } from './n8nService';

const N8N_API_URL = import.meta.env.VITE_N8N_API_URL || 'https://n8n.srv1167160.hstgr.cloud';

export interface EmailData {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: { filename: string; content: string; contentType?: string }[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface EmailTrackingData {
  campaignId: string;
  recipientEmail: string;
  opened?: boolean;
  openedAt?: string;
  clicked?: boolean;
  clickedAt?: string;
  linkClicked?: string;
  bounced?: boolean;
  bounceReason?: string;
}

class EmailService {
  private n8nUrl: string;

  constructor(n8nUrl: string = N8N_API_URL) {
    this.n8nUrl = n8nUrl;
  }

  // Send a single email via n8n
  async sendEmail(data: EmailData): Promise<EmailResult> {
    try {
      const result = await n8nService.sendEmail({
        to: Array.isArray(data.to) ? data.to.join(',') : data.to,
        subject: data.subject,
        body: data.html || data.body,
        from: data.from,
        templateId: data.templateId,
      });

      return {
        success: result.status === 'success',
        messageId: result.data?.messageId,
        error: result.error,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Email send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Send bulk emails via n8n workflow
  async sendBulkEmail(recipients: string[], data: Omit<EmailData, 'to'>): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const to of recipients) {
      const result = await this.sendEmail({ ...data, to });
      results.push(result);
      // Small delay between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  // Send email campaign via n8n workflow
  async sendCampaign(campaignData: {
    name: string;
    recipients: { email: string; name?: string; data?: Record<string, any> }[];
    subject: string;
    templateId?: string;
    templateHtml?: string;
    fromName?: string;
    fromEmail?: string;
  }): Promise<{ success: boolean; sent: number; failed: number; campaignId?: string }> {
    try {
      const webhookUrl = `${this.n8nUrl}/webhook/email-campaign`;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: campaignData.name,
          recipients: campaignData.recipients,
          subject: campaignData.subject,
          templateId: campaignData.templateId,
          templateHtml: campaignData.templateHtml,
          from: campaignData.fromEmail,
          fromName: campaignData.fromName,
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        sent: result.sent || 0,
        failed: result.failed || 0,
        campaignId: result.campaignId,
      };
    } catch (error) {
      console.error('Campaign send failed:', error);
      return {
        success: false,
        sent: 0,
        failed: campaignData.recipients.length,
      };
    }
  }

  // Track email open/click via webhook
  async trackEmailEvent(trackingId: string, event: 'open' | 'click', metadata?: { linkUrl?: string }): Promise<void> {
    try {
      const webhookUrl = `${this.n8nUrl}/webhook/email-tracking`;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId,
          event,
          timestamp: new Date().toISOString(),
          ...metadata,
        }),
      });
    } catch (error) {
      console.error('Email tracking failed:', error);
    }
  }

  // Get email templates
  async getTemplates(): Promise<{ id: string; name: string; subject?: string }[]> {
    // Return available email templates
    return [
      { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to Recipe Labs!' },
      { id: 'lead-follow-up', name: 'Lead Follow-up', subject: 'Following up on your interest' },
      { id: 'proposal', name: 'Proposal', subject: 'Proposal for your project' },
      { id: 'newsletter', name: 'Newsletter', subject: 'Recipe Labs Newsletter' },
      { id: 'cold-outreach', name: 'Cold Outreach', subject: 'Quick question' },
    ];
  }

  // Generate personalized email content using AI
  async generateEmailContent(prompt: string, context?: { recipientName?: string; company?: string; industry?: string }): Promise<{ subject: string; body: string }> {
    try {
      const webhookUrl = `${this.n8nUrl}/webhook/generate-email`;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      const result = await response.json();
      return {
        subject: result.subject || 'Generated Subject',
        body: result.body || result.content || '',
      };
    } catch (error) {
      console.error('Email generation failed:', error);
      return {
        subject: 'Follow up',
        body: 'Hi,\n\nI wanted to reach out regarding...',
      };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
