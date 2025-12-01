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
  generarResumen(transcripcion: string): Promise<string>;
  generarGlosario(transcripcion: string): Promise<any[]>;
  generarQuiz(transcripcion: string): Promise<any[]>;
  generarChecklist(transcripcion: string): Promise<string[]>;
}
