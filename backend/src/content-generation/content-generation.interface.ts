export const CONTENT_GENERATOR = 'IContentGenerator';

// Esta es la estructura exacta que tu Frontend necesita recibir
export interface GeneratedContent {
  resumen: string; // Markdown
  glosario: { termino: string; definicion: string }[];
  quiz: {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: string;
    justificacion: string;
  }[];
  checklist: string[];
}

export interface IContentGenerator {
  generarMaterial(textoTranscrito: string): Promise<GeneratedContent>;
}
