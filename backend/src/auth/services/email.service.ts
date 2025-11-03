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
      subject: '🔐 Código de Verificación - RootSearch',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .code-box {
                background-color: #f8f9fa;
                border: 2px dashed #667eea;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                display: inline-block;
              }
              .verification-code {
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                margin: 10px 0;
              }
              .message {
                color: #555;
                font-size: 16px;
                line-height: 1.6;
                margin: 20px 0;
              }
              .warning {
                color: #dc3545;
                font-size: 14px;
                margin-top: 20px;
              }
              .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              .emoji {
                font-size: 48px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 RootSearch</h1>
                <p>Plataforma de Gestión Académica</p>
              </div>
              
              <div class="content">
                <div class="emoji">🔐</div>
                <h2>¡Hola, ${userName}!</h2>
                <p class="message">
                  Has iniciado sesión en tu cuenta de RootSearch.<br>
                  Por seguridad, necesitamos verificar tu identidad.
                </p>
                
                <div class="code-box">
                  <p style="margin: 0; color: #666; font-size: 14px;">Tu código de verificación es:</p>
                  <div class="verification-code">${code}</div>
                  <p style="margin: 0; color: #666; font-size: 12px;">Válido por 15 minutos</p>
                </div>
                
                <p class="message">
                  Ingresa este código en la aplicación para completar el proceso de inicio de sesión.
                </p>
                
                <p class="warning">
                  ⚠️ Si no has sido tú quien intentó iniciar sesión,<br>
                  por favor ignora este correo y cambia tu contraseña.
                </p>
              </div>
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas.</p>
                <p>© ${new Date().getFullYear()} RootSearch - Todos los derechos reservados</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        RootSearch - Código de Verificación
        
        ¡Hola, ${userName}!
        
        Has iniciado sesión en tu cuenta de RootSearch.
        Tu código de verificación es: ${code}
        
        Este código es válido por 15 minutos.
        
        Si no has sido tú, por favor ignora este correo.
        
        © ${new Date().getFullYear()} RootSearch
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw new Error('Error al enviar el correo de verificación');
    }
  }

  async sendWelcomeEmail(email: string, code: number, userName: string) {
    const mailOptions = {
      from: `"RootSearch" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: '🎉 ¡Bienvenido a RootSearch!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .code-box {
                background-color: #f8f9fa;
                border: 2px dashed #667eea;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                display: inline-block;
              }
              .verification-code {
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                margin: 10px 0;
              }
              .message {
                color: #555;
                font-size: 16px;
                line-height: 1.6;
                margin: 20px 0;
              }
              .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              .emoji {
                font-size: 48px;
                margin-bottom: 20px;
              }
              .feature {
                background-color: #f8f9fa;
                padding: 15px;
                margin: 10px 0;
                border-radius: 6px;
                border-left: 4px solid #667eea;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 RootSearch</h1>
                <p>Plataforma de Gestión Académica</p>
              </div>
              
              <div class="content">
                <div class="emoji">🎉</div>
                <h2>¡Bienvenido, ${userName}!</h2>
                <p class="message">
                  ¡Nos alegra que te hayas unido a RootSearch!<br>
                  Tu cuenta ha sido creada exitosamente.
                </p>
                
                <div class="code-box">
                  <p style="margin: 0; color: #666; font-size: 14px;">Para activar tu cuenta, usa este código de verificación:</p>
                  <div class="verification-code">${code}</div>
                  <p style="margin: 0; color: #666; font-size: 12px;">Válido por 15 minutos</p>
                </div>
                
                <p class="message">
                  Ingresa este código en la aplicación para completar tu registro<br>
                  y comenzar a disfrutar de todas las funcionalidades.
                </p>

                <div style="margin: 30px 0; text-align: left;">
                  <h3 style="color: #667eea; text-align: center;">¿Qué puedes hacer en RootSearch?</h3>
                  
                  <div class="feature">
                    📚 <strong>Gestión de Cursos:</strong> Accede a tus cursos y materiales de estudio.
                  </div>
                  
                  <div class="feature">
                    👥 <strong>Colaboración:</strong> Interactúa con docentes y compañeros.
                  </div>
                  
                  <div class="feature">
                    📊 <strong>Seguimiento:</strong> Monitorea tu progreso académico.
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas.</p>
                <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
                <p>© ${new Date().getFullYear()} RootSearch - Todos los derechos reservados</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        ¡Bienvenido a RootSearch!
        
        ¡Hola, ${userName}!
        
        Nos alegra que te hayas unido a RootSearch.
        Tu cuenta ha sido creada exitosamente.
        
        Para activar tu cuenta, usa este código de verificación: ${code}
        
        Este código es válido por 15 minutos.
        
        ¿Qué puedes hacer en RootSearch?
        - Gestión de Cursos: Accede a tus cursos y materiales de estudio
        - Colaboración: Interactúa con docentes y compañeros
        - Seguimiento: Monitorea tu progreso académico
        
        Si no creaste esta cuenta, puedes ignorar este correo.
        
        © ${new Date().getFullYear()} RootSearch
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de bienvenida enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      throw new Error('Error al enviar el correo de bienvenida');
    }
  }
}
