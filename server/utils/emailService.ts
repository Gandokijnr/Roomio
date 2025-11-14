import type { EmailTemplate } from './emailTemplates'

export interface EmailConfig {
  provider: 'console' | 'sendgrid' | 'resend' | 'mailgun'
  apiKey?: string
  fromEmail: string
  fromName: string
}

export interface EmailData {
  to: string
  toName?: string
  template: EmailTemplate
}

export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'console':
          return this.sendConsoleEmail(data)
        case 'sendgrid':
          return this.sendSendGridEmail(data)
        case 'resend':
          return this.sendResendEmail(data)
        case 'mailgun':
          return this.sendMailgunEmail(data)
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`)
      }
    } catch (error: any) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }
  }

  private async sendConsoleEmail(data: EmailData): Promise<{ success: boolean; messageId: string }> {
    console.log('\n📧 EMAIL WOULD BE SENT:')
    console.log('=====================================')
    console.log(`From: ${this.config.fromName} <${this.config.fromEmail}>`)
    console.log(`To: ${data.toName || ''} <${data.to}>`)
    console.log(`Subject: ${data.template.subject}`)
    console.log('-------------------------------------')
    console.log('TEXT VERSION:')
    console.log(data.template.text)
    console.log('-------------------------------------')
    console.log('HTML VERSION:')
    console.log(data.template.html.substring(0, 200) + '...')
    console.log('=====================================\n')
    
    return { success: true, messageId: `console-${Date.now()}` }
  }

  private async sendSendGridEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key is required')
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: data.to, name: data.toName }]
        }],
        from: { email: this.config.fromEmail, name: this.config.fromName },
        subject: data.template.subject,
        content: [
          { type: 'text/plain', value: data.template.text },
          { type: 'text/html', value: data.template.html }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SendGrid error: ${error}`)
    }

    const messageId = response.headers.get('x-message-id')
    return { success: true, messageId: messageId || undefined }
  }

  private async sendResendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.apiKey) {
      throw new Error('Resend API key is required')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [data.to],
        subject: data.template.subject,
        text: data.template.text,
        html: data.template.html
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend error: ${error}`)
    }

    const result = await response.json()
    return { success: true, messageId: result.id }
  }

  private async sendMailgunEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.apiKey) {
      throw new Error('Mailgun API key is required')
    }

    // Extract domain from fromEmail
    const domain = this.config.fromEmail.split('@')[1]
    
    const formData = new FormData()
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`)
    formData.append('to', data.to)
    formData.append('subject', data.template.subject)
    formData.append('text', data.template.text)
    formData.append('html', data.template.html)

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mailgun error: ${error}`)
    }

    const result = await response.json()
    return { success: true, messageId: result.id }
  }
}

// Factory function to create email service based on environment
export function createEmailService(): EmailService {
  const provider = (process.env.EMAIL_PROVIDER || 'console') as EmailConfig['provider']
  
  const config: EmailConfig = {
    provider,
    apiKey: process.env.EMAIL_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'noreply@roomio.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Roomio Team'
  }

  return new EmailService(config)
}
