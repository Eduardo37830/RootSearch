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
  private readonly apiUrl = 'http://localhost:1234/v1/chat/completions';

  constructor(private readonly httpService: HttpService) {}

  async generarResumen(transcripcion: string): Promise<string> {
    const prompt = `
      Actúa como un Profesor Universitario. Genera un RESUMEN ESTRUCTURADO (Markdown) de esta clase.
      Usa títulos (##), negritas y listas. Enfócate en los argumentos principales y conclusiones.
      NO respondas con JSON, solo texto Markdown bien formateado.
    `;
    return this.llamarIA(prompt, transcripcion, 0.4);
  }

  async generarQuiz(transcripcion: string): Promise<any[]> {
    const prompt = `
      Genera un QUIZ de 5 preguntas (selección múltiple) basado en el texto.
      Responde ÚNICAMENTE con este JSON: 
      { "quiz": [{ "pregunta": "...", "opciones": [], "respuestaCorrecta": "...", "justificacion": "..." }] }
    `;
    const json = await this.llamarIA(prompt, transcripcion, 0.2);
    return this.parsearJson(json, 'quiz');
  }

  async generarGlosario(transcripcion: string): Promise<any[]> {
    const prompt = `Extrae un GLOSARIO (JSON): { "glosario": [{ "term": "...", "definition": "..." }] }`;
    const json = await this.llamarIA(prompt, transcripcion, 0.2);
    return this.parsearJson(json, 'glosario');
  }

  async generarChecklist(transcripcion: string): Promise<string[]> {
    const prompt = `
      Crea una CHECKLIST de 5 a 7 puntos clave para estudiar este tema.
      Responde ÚNICAMENTE con un JSON válido con esta estructura:
      { "checklist": ["Punto 1", "Punto 2"] }
    `;
    const json = await this.llamarIA(prompt, transcripcion, 0.3);
    return this.parsearJson(json, 'checklist');
  }

  // --- UTILIDADES GENÉRICAS ---

  private async llamarIA(
    systemPrompt: string,
    userContent: string,
    temp: number,
  ): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService.post(this.apiUrl, {
        model: 'local-model',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: temp,
        stream: false,
      }),
    );
    return data.choices[0].message.content;
  }

  private parsearJson(textoRaw: string, key: string): any {
    let limpio = textoRaw.trim();
    try {
      // Limpieza agresiva de bloques de código markdown (Case insensitive)
      limpio = limpio.replace(/```json/gi, '').replace(/```/g, '');

      // Búsqueda de llaves
      const inicio = limpio.indexOf('{');
      const fin = limpio.lastIndexOf('}');
      if (inicio !== -1 && fin !== -1) {
        limpio = limpio.substring(inicio, fin + 1);
      }

      const objeto = JSON.parse(limpio);
      return objeto[key] || []; // Devolvemos solo el array interno
    } catch (e) {
      this.logger.warn(
        `Fallo al parsear JSON para ${key}. Error: ${e.message}. Intentado: ${limpio.substring(0, 100)}...`,
      );
      return []; // Fallback seguro para no romper todo el proceso
    }
  }
}
