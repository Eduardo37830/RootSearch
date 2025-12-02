import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { GeneratedMaterial } from '../schemas/material.schema';

@Injectable()
export class PdfExporterService {
  private readonly logger = new Logger(PdfExporterService.name);

  async generatePdf(material: GeneratedMaterial): Promise<Buffer> {
    this.logger.log(`Generando PDF para material: ${material._id}`);

    // 1. Convertir el resumen de Markdown a HTML
    // Bypass TypeScript transpilation of dynamic import to require
    const { marked } = await (eval('import("marked")') as Promise<
      typeof import('marked')
    >);
    const resumenHtml = await marked.parse(material.resumen || '');

    // 2. Plantilla HTML con CSS (Diseño académico limpio)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          h1 { color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px; }
          h2 { color: #2c5282; margin-top: 30px; background-color: #ebf8ff; padding: 8px; border-radius: 5px; }
          h3 { color: #2b6cb0; }
          .badge { background: #3182ce; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
          
          /* Resumen */
          .resumen-box { text-align: justify; }
          
          /* Glosario */
          .term-item { margin-bottom: 10px; }
          .term-name { font-weight: bold; color: #2c5282; }
          
          /* Quiz */
          .quiz-card { border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; border-radius: 8px; page-break-inside: avoid; }
          .quiz-question { font-weight: bold; margin-bottom: 8px; }
          .quiz-option { margin-left: 20px; color: #4a5568; }
          .quiz-answer { margin-top: 10px; font-size: 0.9em; color: #276749; background: #f0fff4; padding: 5px; border-radius: 4px; }
          
          /* Footer */
          .footer { margin-top: 50px; font-size: 0.8em; text-align: center; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div style="text-align: right;">
          <span class="badge">RootSearch Material</span>
        </div>
        
        <h1>Material de Estudio Complementario</h1>
        <p><strong>Generado automáticamente por IA</strong></p>

        <h2>📚 Resumen Estructurado</h2>
        <div class="resumen-box">
          ${resumenHtml}
        </div>

        <h2>📖 Glosario de Términos</h2>
        ${material.glosario
          .map(
            (g) => `
          <div class="term-item">
            <span class="term-name">${g.term}:</span> ${g.definition}
          </div>
        `,
          )
          .join('')}

        <h2>📝 Quiz de Repaso</h2>
        ${material.quiz
          .map(
            (q, idx) => `
          <div class="quiz-card">
            <div class="quiz-question">${idx + 1}. ${q.pregunta}</div>
            ${q.opciones.map((opt) => `<div class="quiz-option">○ ${opt}</div>`).join('')}
            <div class="quiz-answer">
              <strong>Respuesta:</strong> ${q.respuestaCorrecta}<br>
              <em>Justificación: ${q.justificacion}</em>
            </div>
          </div>
        `,
          )
          .join('')}

        <h2>✅ Checklist de Estudio</h2>
        <ul>
        ${material.checklist.map((item) => `<li>${item}</li>`).join('')}
        </ul>

        <div class="footer">
          Documento generado el ${new Date().toLocaleDateString()} | RootSearch
        </div>
      </body>
      </html>
    `;

    // 3. Generar PDF con Puppeteer
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necesario para algunos entornos Docker/Linux
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      if (browser) await browser.close();
    }
  }
}
