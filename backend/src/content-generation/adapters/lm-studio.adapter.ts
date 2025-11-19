import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  IContentGenerator,
  GeneratedContent,
} from '../content-generation.interface';

@Injectable()
export class LmStudioAdapter implements IContentGenerator {
  private readonly logger = new Logger(LmStudioAdapter.name);
  // URL por defecto de LM Studio
  private readonly apiUrl = 'http://localhost:1234/v1/chat/completions';

  constructor(private readonly httpService: HttpService) {}

  async generarMaterial(transcripcion: string): Promise<GeneratedContent> {
    this.logger.log('🧠 Enviando texto a LM Studio...');

    // 1. El Prompt Maestro: Instrucciones precisas para obtener JSON
    const systemPrompt = `
      Eres un experto pedagogo y profesor universitario.
      Tu tarea es analizar la transcripción de una clase y generar material de estudio estructurado.
      
      IMPORTANTE: 
      1. Responde ÚNICAMENTE con un objeto JSON válido.
      2. Asegúrate de escapar correctamente las comillas dobles dentro de los textos (usa \\").
      3. Para los saltos de línea en el resumen, usa \\n, NO uses saltos de línea reales.
      
      El JSON debe tener esta estructura exacta:
      {
        "resumen": "Un resumen detallado en formato Markdown con títulos y viñetas (usa \\n para saltos de línea)",
        "glosario": [{"termino": "...", "definicion": "..."}],
        "quiz": [
            {"pregunta": "...", "opciones": ["A)...", "B)..."], "respuestaCorrecta": "...", "justificacion": "..."}
        ],
        "checklist": ["Tarea 1", "Lectura sugerida", "Concepto a repasar"]
      }
    `;

    try {
      // 2. Enviar la petición a LM Studio
      const { data } = await firstValueFrom(
        this.httpService.post(this.apiUrl, {
          model: 'google/gemma-3n-e4b', // LM Studio usa el modelo que tengas cargado
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Analiza esta transcripción:\n\n${transcripcion.substring(0, 12000)}`,
            },
          ],
          temperature: 0.1, // Aún más bajo para forzar estructura
          stream: false,
        }),
      );

      // 3. Limpiar y Parsear la respuesta
      let contenido = data.choices[0].message.content;

      // Truco: A veces la IA dice "Aquí está tu JSON: ...", limpiamos eso
      const jsonStart = contenido.indexOf('{');
      const jsonEnd = contenido.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        contenido = contenido.substring(jsonStart, jsonEnd + 1);
      }

      try {
        return JSON.parse(contenido) as GeneratedContent;
      } catch (parseError) {
        this.logger.error(
          'Error al parsear JSON de la IA. Contenido recibido:',
          contenido,
        );
        throw parseError;
      }
    } catch (error) {
      this.logger.error('Error conectando con LM Studio', error);
      throw new Error('Falló la generación de contenido con IA');
    }
  }
}
