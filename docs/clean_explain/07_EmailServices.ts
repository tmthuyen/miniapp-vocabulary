// src/infrastructure/email/SendgridEmailService.ts
import { IEmailService } from '@/application/interfaces/IEmailService';
import sgMail from '@sendgrid/mail';

export class SendgridEmailService implements IEmailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const msg = {
      to: email,
      from: 'noreply@example.com',
      subject: 'Welcome!',
      html: `<h1>Welcome ${name}!</h1><p>Thanks for joining us.</p>`,
    };

    await sgMail.send(msg);
  }

  async sendOrderConfirmation(email: string, orderId: string): Promise<void> {
    const msg = {
      to: email,
      from: 'orders@example.com',
      subject: `Order Confirmation #${orderId}`,
      html: `<h1>Order Confirmed</h1><p>Order ID: ${orderId}</p>`,
    };

    await sgMail.send(msg);
  }

  async sendResetPassword(email: string, resetLink: string): Promise<void> {
    const msg = {
      to: email,
      from: 'security@example.com',
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset password</p>`,
    };

    await sgMail.send(msg);
  }
}

// src/infrastructure/email/ResendEmailService.ts
import { IEmailService } from '@/application/interfaces/IEmailService';
import { Resend } from 'resend';

export class ResendEmailService implements IEmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome!',
      html: `<h1>Welcome ${name}!</h1>`,
    });
  }

  async sendOrderConfirmation(email: string, orderId: string): Promise<void> {
    await this.resend.emails.send({
      from: 'orders@resend.dev',
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: `<h1>Order Confirmed</h1><p>Order ID: ${orderId}</p>`,
    });
  }

  async sendResetPassword(email: string, resetLink: string): Promise<void> {
    await this.resend.emails.send({
      from: 'security@resend.dev',
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset password</p>`,
    });
  }
}

// src/infrastructure/email/MockEmailService.ts (for testing)
import { IEmailService } from '@/application/interfaces/IEmailService';

export class MockEmailService implements IEmailService {
  private sentEmails: any[] = [];

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.sentEmails.push({ type: 'welcome', email, name });
    console.log(`[MOCK] Sending welcome email to ${email}`);
  }

  async sendOrderConfirmation(email: string, orderId: string): Promise<void> {
    this.sentEmails.push({ type: 'order', email, orderId });
    console.log(`[MOCK] Sending order confirmation to ${email}`);
  }

  async sendResetPassword(email: string, resetLink: string): Promise<void> {
    this.sentEmails.push({ type: 'reset', email, resetLink });
    console.log(`[MOCK] Sending password reset to ${email}`);
  }

  getSentEmails() {
    return this.sentEmails;
  }
}
