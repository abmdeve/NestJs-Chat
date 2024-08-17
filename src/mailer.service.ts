import { Resend } from 'resend';

export class MailerService {
  private readonly mailer: Resend;
  constructor() {
    this.mailer = new Resend(process.env.RESEND_API_KEY);
  }
  async sendCreateAccount({
    recipient,
    firstname,
  }: {
    recipient: string;
    firstname: string;
  }) {
    try {
      const data = await this.mailer.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [recipient],
        subject: 'WELCOME TO THE PLATEFORM',
        html: `HELLO ${firstname}, AND WELCOME TO NESTJS FRAMEWORK JS BACKEND GUY...`,
      });

      console.log("const resend = new Resend('');", data);
    } catch (error) {
      console.log('ERROR RESEND MAILER', error);
    }
  }

  async sendRequestPasswordEmail({
    recipient,
    firstname,
    token,
  }: {
    recipient: string;
    firstname: string;
    token: string;
  }) {
    try {
      const link = `${process.env.FRONTEND_URL}/forgot-password?token=${token}`;
      const data = await this.mailer.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [recipient],
        subject: 'FOR REINITIALIZATION PASSWORD',
        html: `HELLO ${firstname}, YOUR REINIT LINK IS ${link}`,
      });

      console.log("const resend = new Resend('');", data);
    } catch (error) {
      console.log('ERROR RESEND MAILER', error);
    }
  }
}
