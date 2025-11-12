import { Injectable, Inject } from '@nestjs/common';
import {
  TRANSCRIPTOR_SERVICE,
  ITranscriptor,
} from '../transcription/transcription.interface';
import { ReadStream } from 'fs';

@Injectable()
export class AudioService {
  constructor(
    @Inject(TRANSCRIPTOR_SERVICE)
    private readonly transcriptor: ITranscriptor,
  ) {}

  /**
   * Transcribe un archivo de audio a texto
   * Acepta tanto ReadStream como ruta de archivo
   *
   * @param audioInput - ReadStream o ruta del archivo
   * @param language - Código de idioma (ej: 'es', 'en', 'fr')
   * @returns Texto transcrito
   */
  async transcribeAudio(
    audioInput: ReadStream | string,
    language: string = 'es',
  ): Promise<string> {
    try {
      console.log(`🎤 Iniciando transcripción en idioma: ${language}`);
      const transcript = await this.transcriptor.transcribir(
        audioInput,
        language,
      );
      console.log(`✅ Transcripción completada exitosamente`);
      return transcript;
    } catch (error) {
      console.error('❌ Error durante la transcripción:', error.message);
      throw error;
    }
  }

  /**
   * Procesa un archivo de audio: carga, transcribe y retorna el resultado
   * Este es un ejemplo de cómo integrar la transcripción en tu flujo de negocio
   */
  async processAudioFile(
    audioInput: ReadStream | string,
    metadata: any,
  ): Promise<any> {
    const language = metadata?.language || 'es';

    try {
      const transcription = await this.transcribeAudio(audioInput, language);

      // Aquí puedes procesar más el texto, guardar en BD, etc.
      return {
        success: true,
        transcription,
        metadata,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata,
      };
    }
  }
}
