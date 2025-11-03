import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: this.configService.get<string>('EMAIL_SERVICE'),
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            },
        });
    }

    async sendVerificationCode(email: string, code: number, userName: string) {
        const mailOptions = {
            from: `"RootSearch" <${this.configService.get<string>('EMAIL_USER')}>`,
            to: email,
            subject: 'Código de verificación - RootSearch',
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; color: #222; margin: 0; padding: 20px;">
                        <div style="max-width:600px; margin:0 auto;">
                            <h1 style="font-size:18px; margin:0 0 10px;">RootSearch</h1>
                            <p style="margin:0 0 12px;">Hola ${userName},</p>
                            <p style="margin:0 0 12px;">Tu código de verificación es:</p>
                            <div style="font-weight:bold; font-size:20px; background:#f2f2f2; padding:10px; display:inline-block; border-radius:4px;">
                                ${code}
                            </div>
                            <p style="margin:16px 0 0; font-size:12px; color:#666;">Válido por 15 minutos.</p>
                            <hr style="border:none; border-top:1px solid #eee; margin:18px 0;">
                            <p style="font-size:12px; color:#888; margin:0;">Este es un correo automático, por favor no responda.<br>© ${new Date().getFullYear()} RootSearch</p>
                        </div>
                    </body>
                </html>
            `,
            text: `RootSearch - Código de verificación

Hola ${userName},

Tu código de verificación es: ${code}

Válido por 15 minutos.

Este es un correo automático. © ${new Date().getFullYear()} RootSearch`,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error enviando email:', error);
            throw new Error('Error al enviar el correo de verificación');
        }
    }

    async sendWelcomeEmail(email: string, code: number, userName: string) {
        const mailOptions = {
            from: `"RootSearch" <${this.configService.get<string>('EMAIL_USER')}>`,
            to: email,
            subject: 'Bienvenido a RootSearch',
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; color: #222; margin: 0; padding: 20px;">
                        <div style="max-width:600px; margin:0 auto;">
                            <h1 style="font-size:18px; margin:0 0 10px;">RootSearch</h1>
                            <p style="margin:0 0 12px;">Hola ${userName},</p>
                            <p style="margin:0 0 12px;">Gracias por registrarte. Para activar tu cuenta usa el siguiente código:</p>
                            <div style="font-weight:bold; font-size:20px; background:#f2f2f2; padding:10px; display:inline-block; border-radius:4px;">
                                ${code}
                            </div>
                            <p style="margin:16px 0 0; font-size:12px; color:#666;">Válido por 15 minutos.</p>
                            <hr style="border:none; border-top:1px solid #eee; margin:18px 0;">
                            <p style="font-size:12px; color:#888; margin:0;">Este es un correo automático, por favor no responda.<br>© ${new Date().getFullYear()} RootSearch</p>
                        </div>
                    </body>
                </html>
            `,
            text: `Bienvenido a RootSearch

Hola ${userName},

Gracias por registrarte. Para activar tu cuenta usa el siguiente código: ${code}

Válido por 15 minutos.

Este es un correo automático. © ${new Date().getFullYear()} RootSearch`,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email de bienvenida enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error enviando email de bienvenida:', error);
            throw new Error('Error al enviar el correo de bienvenida');
        }
    }

    async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
        const frontend = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const resetLink = `${frontend}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"RootSearch" <${this.configService.get<string>('EMAIL_USER')}>`,
            to: email,
            subject: 'Recuperación de contraseña - RootSearch',
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; color: #222; margin: 0; padding: 20px;">
                        <div style="max-width:600px; margin:0 auto;">
                            <h1 style="font-size:18px; margin:0 0 10px;">RootSearch</h1>
                            <p style="margin:0 0 12px;">Hola ${userName},</p>
                            <p style="margin:0 0 12px;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el enlace a continuación:</p>
                            <p style="margin:10px 0;"><a href="${resetLink}" style="background:#3b78d8; color:#fff; padding:8px 12px; text-decoration:none; border-radius:4px;">Restablecer contraseña</a></p>
                            <p style="font-size:12px; color:#666; margin:10px 0 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                            <div style="word-break:break-all; font-size:12px; color:#333; background:#f7f7f7; padding:8px; border-radius:4px; margin-top:8px;">
                                ${resetLink}
                            </div>
                            <p style="font-size:12px; color:#666; margin:16px 0 0;">El enlace es válido 1 hora y se puede usar una sola vez.</p>
                            <hr style="border:none; border-top:1px solid #eee; margin:18px 0;">
                            <p style="font-size:12px; color:#888; margin:0;">Este es un correo automático, por favor no responda.<br>© ${new Date().getFullYear()} RootSearch</p>
                        </div>
                    </body>
                </html>
            `,
            text: `RootSearch - Recuperación de contraseña

Hola ${userName},

Recibimos una solicitud para restablecer tu contraseña.

Usa este enlace para restablecerla:
${resetLink}

El enlace es válido por 1 hora y solo se puede usar una vez.

Si no solicitaste esto, ignora este correo.

© ${new Date().getFullYear()} RootSearch`,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email de recuperación enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error enviando email de recuperación:', error);
            throw new Error('Error al enviar el correo de recuperación de contraseña');
        }
    }
}
