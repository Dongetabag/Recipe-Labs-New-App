// Recipe Labs Resend Email Service
// Direct integration with Resend API for email sending

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com';
const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:5000';

export interface ResendEmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  headers?: Record<string, string>;
  attachments?: {
    filename: string;
    content: string; // base64 encoded
    content_type?: string;
  }[];
  tags?: { name: string; value: string }[];
}

export interface ResendResponse {
  id?: string;
  success: boolean;
  error?: string;
}

export interface ResendEmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

class ResendService {
  private apiKey: string;
  private defaultFrom: string;

  constructor() {
    this.apiKey = RESEND_API_KEY || '';
    this.defaultFrom = 'Recipe Labs <hello@madebyrecipe.com>';
  }

  // Check if Resend is configured
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('re_');
  }

  // Send email via Resend API
  async sendEmail(data: ResendEmailData): Promise<ResendResponse> {
    if (!this.isConfigured()) {
      console.error('Resend API key not configured');
      return { success: false, error: 'Resend API key not configured' };
    }

    try {
      const response = await fetch(`${RESEND_API_URL}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: data.from || this.defaultFrom,
          to: Array.isArray(data.to) ? data.to : [data.to],
          subject: data.subject,
          html: data.html,
          text: data.text,
          reply_to: data.replyTo,
          cc: data.cc,
          bcc: data.bcc,
          headers: data.headers,
          attachments: data.attachments,
          tags: data.tags,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || 'Failed to send email',
        };
      }

      return {
        id: result.id,
        success: true,
      };
    } catch (error) {
      console.error('Resend email failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Send email via Agent API (backend proxy - more secure)
  async sendEmailViaAgent(data: ResendEmailData): Promise<ResendResponse> {
    try {
      const response = await fetch(`${AGENT_API_URL}/api/v1/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'resend',
          ...data,
          from: data.from || this.defaultFrom,
        }),
      });

      const result = await response.json();
      return {
        id: result.messageId || result.id,
        success: response.ok && result.success !== false,
        error: result.error,
      };
    } catch (error) {
      // Fallback to direct Resend if agent API fails
      console.warn('Agent API unavailable, using direct Resend:', error);
      return this.sendEmail(data);
    }
  }

  // Send bulk emails
  async sendBulkEmails(
    recipients: { email: string; name?: string; data?: Record<string, any> }[],
    template: { subject: string; html: string; text?: string },
    options?: { from?: string; delayMs?: number }
  ): Promise<{ sent: number; failed: number; results: ResendResponse[] }> {
    const results: ResendResponse[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      // Replace template variables
      let html = template.html;
      let subject = template.subject;

      if (recipient.name) {
        html = html.replace(/{{name}}/g, recipient.name);
        subject = subject.replace(/{{name}}/g, recipient.name);
      }

      if (recipient.data) {
        for (const [key, value] of Object.entries(recipient.data)) {
          html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
          subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
      }

      const result = await this.sendEmail({
        to: recipient.email,
        subject,
        html,
        text: template.text,
        from: options?.from,
        tags: [{ name: 'campaign', value: 'bulk' }],
      });

      results.push(result);

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Delay between sends to avoid rate limiting
      if (options?.delayMs) {
        await new Promise(resolve => setTimeout(resolve, options.delayMs));
      }
    }

    return { sent, failed, results };
  }

  // Send lead outreach email
  async sendLeadOutreach(lead: {
    email: string;
    name: string;
    company?: string;
    website?: string;
  }, template?: { subject?: string; html?: string }): Promise<ResendResponse> {
    const defaultSubject = `Quick question for ${lead.company || lead.name}`;
    const defaultHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hi ${lead.name},</p>
        <p>I came across ${lead.company || 'your business'}${lead.website ? ` at ${lead.website}` : ''} and was impressed by what you're doing.</p>
        <p>We help businesses like yours grow through AI-powered marketing and lead generation. I'd love to share some ideas that could help you.</p>
        <p>Would you be open to a quick 15-minute call this week?</p>
        <p>Best,<br/>Recipe Labs Team</p>
      </div>
    `;

    return this.sendEmail({
      to: lead.email,
      subject: template?.subject || defaultSubject,
      html: template?.html || defaultHtml,
      tags: [
        { name: 'type', value: 'outreach' },
        { name: 'lead', value: lead.email },
      ],
    });
  }

  // Send campaign email to lead
  async sendCampaignEmail(params: {
    to: string;
    subject: string;
    html: string;
    campaignId: string;
    leadId?: string;
  }): Promise<ResendResponse> {
    return this.sendEmail({
      to: params.to,
      subject: params.subject,
      html: params.html,
      tags: [
        { name: 'campaign_id', value: params.campaignId },
        ...(params.leadId ? [{ name: 'lead_id', value: params.leadId }] : []),
      ],
    });
  }

  // Get API status
  async checkStatus(): Promise<{ configured: boolean; valid: boolean }> {
    if (!this.isConfigured()) {
      return { configured: false, valid: false };
    }

    try {
      // Try to get domains to verify API key
      const response = await fetch(`${RESEND_API_URL}/domains`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return {
        configured: true,
        valid: response.ok,
      };
    } catch {
      return { configured: true, valid: false };
    }
  }
}

export const resendService = new ResendService();
export default resendService;
