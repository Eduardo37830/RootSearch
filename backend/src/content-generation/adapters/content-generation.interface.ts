export const CONTENT_GENERATOR = 'IContentGenerator';

export interface GeneratedContent {
  resumen: string; // Markdown
  glosario: { term: string; definition: string }[];
  quiz: {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: string;
    justificacion: string;
  }[];
  checklist: string[];
}

export interface IContentGenerator {
  // Métodos individuales
  generarResumen(transcripcion: string, contexto?: string): Promise<string>;
  generarGlosario(transcripcion: string, contexto?: string): Promise<any[]>;
  generarQuiz(transcripcion: string, contexto?: string): Promise<any[]>;
  generarChecklist(transcripcion: string, contexto?: string): Promise<string[]>;
  calcularAlineacion(
    transcripcion: string,
    contexto: string,
  ): Promise<{ score: number; analisis: string }>;
}
