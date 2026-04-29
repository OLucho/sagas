import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { IEmailService } from '../../domain/services/email.service';

@Injectable()
export class NodemailerEmailService implements IEmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private readonly transporter;

  constructor() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      throw new Error(
        'Email service misconfiguration: SMTP_USER and SMTP_PASS environment variables are required. Create a .env file (see .env.example).',
      );
    }

    this.transporter = createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendPasswordResetCode(to: string, code: string): Promise<void> {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@sagas.app';
    const subject = 'Sagas — Código de recuperación de contraseña';
    const text = `Hola,

Recibimos una solicitud para restablecer tu contraseña de Sagas.

Tu código de recuperación es: ${code}

Este código expira en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.

Saludos,
Equipo Sagas`;
    const html = `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
  <h2>Recuperación de contraseña — Sagas</h2>
  <p>Recibimos una solicitud para restablecer tu contraseña.</p>
  <p>Tu código de recuperación es:</p>
  <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center; margin: 16px 0;">${code}</div>
  <p>Este código expira en <b>15 minutos</b>.</p>
  <p style="color: #6b7280;">Si no solicitaste este cambio, ignora este mensaje.</p>
</div>`;

    try {
      await this.transporter.sendMail({ from, to, subject, text, html });
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      throw error;
    }
  }
}
