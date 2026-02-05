import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !port || !user || !pass) {
      this.logger.warn('Email service not configured. Email sending will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    this.logger.log('Email service initialized successfully');
  }

  async sendContactFormEmail(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('Email transporter not initialized');
      return false;
    }

    const contactEmail = this.configService.get<string>('CONTACT_EMAIL');
    const fromEmail = this.configService.get<string>('SMTP_FROM');

    try {
      await this.transporter.sendMail({
        from: `"Lakeside Farms Website" <${fromEmail}>`,
        to: contactEmail,
        replyTo: data.email,
        subject: `Contact Form: Message from ${data.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #2d5016; margin-bottom: 5px; }
              .value { padding: 10px; background: white; border-left: 3px solid #4a7c2f; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📧 New Contact Form Submission</h1>
              </div>
              <div class="content">
                <p>You have received a new message from the Lakeside Farms website contact form.</p>
                
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${data.name}</div>
                </div>
                
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                </div>
                
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
                
                <p style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-left: 4px solid #4a7c2f;">
                  <strong>💡 Quick Tip:</strong> Click the "Reply" button in your email client to respond directly to ${data.name}.
                </p>
              </div>
              <div class="footer">
                <p>This email was sent from the Lakeside Farms contact form</p>
                <p>Lakeside Farms | P.O.BOX 236 Ofankor-Accra, Ghana</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}

---
This email was sent from the Lakeside Farms contact form
Reply to this email to respond to ${data.name}
        `,
      });

      this.logger.log(`Contact form email sent successfully from ${data.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send contact form email: ${error.message}`);
      return false;
    }
  }

  async sendAutoReply(email: string, name: string): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    const fromEmail = this.configService.get<string>('SMTP_FROM');

    try {
      await this.transporter.sendMail({
        from: `"Lakeside Farms" <${fromEmail}>`,
        to: email,
        subject: 'Thank you for contacting Lakeside Farms',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌾 Thank You!</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                
                <p>Thank you for reaching out to Lakeside Farms! We have received your message and will get back to you as soon as possible.</p>
                
                <p>Our team typically responds within 24-48 hours during business hours (Monday - Saturday, 7:00 AM - 6:00 PM).</p>
                
                <p><strong>In the meantime:</strong></p>
                <ul>
                  <li>📞 Call us: +233 543 024 779 / +233 268 000 341</li>
                  <li>💬 WhatsApp: +233 543 024 779</li>
                  <li>📧 Email: lakesidefarmgh@gmail.com</li>
                </ul>
                
                <p>Thank you for your interest in Lakeside Farms!</p>
                
                <p>Best regards,<br>
                <strong>The Lakeside Farms Team</strong></p>
              </div>
              <div class="footer">
                <p>Lakeside Farms - Your trusted partner in sustainable agriculture</p>
                <p>P.O.BOX 236 Ofankor-Accra, Ghana</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Dear ${name},

Thank you for reaching out to Lakeside Farms! We have received your message and will get back to you as soon as possible.

Our team typically responds within 24-48 hours during business hours (Monday - Saturday, 7:00 AM - 6:00 PM).

In the meantime:
- Call us: +233 543 024 779 / +233 268 000 341
- WhatsApp: +233 543 024 779
- Email: lakesidefarmgh@gmail.com

Thank you for your interest in Lakeside Farms!

Best regards,
The Lakeside Farms Team

---
Lakeside Farms - Your trusted partner in sustainable agriculture
P.O.BOX 236 Ofankor-Accra, Ghana
        `,
      });

      this.logger.log(`Auto-reply sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send auto-reply: ${error.message}`);
      return false;
    }
  }
}
