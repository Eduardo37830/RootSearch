import { Injectable, Inject } from '@nestjs/common';
import {
  TRANSCRIPTOR_SERVICE,
  ITranscriptor,
} from '../transcription/transcription.interface';
import { TranscriptionService } from '../transcription/transcription.service';
import { ReadStream } from 'fs';

@Injectable()
export class AudioService {
  constructor(
    @Inject(TRANSCRIPTOR_SERVICE)
    private readonly transcriptor: ITranscriptor,
    private readonly transcriptionService: TranscriptionService,
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
   * Procesa un archivo de audio: carga, transcribe y guarda en MongoDB
   * Este es un ejemplo de cómo integrar la transcripción en tu flujo de negocio
   */
  async processAudioFile(
    audioInput: ReadStream | string,
    metadata: any,
  ): Promise<any> {
    const language = metadata?.language || 'es';

    try {
      const transcription = await this.transcribeAudio(audioInput, language);

      // Guarda la transcripción en MongoDB
      const savedTranscription = await this.transcriptionService.create({
        userId: metadata.userId,
        courseId: metadata.courseId,
        text: transcription,
        originalFileName: metadata.fileName,
        fileSize: metadata.fileSize,
        language,
        processingTime: metadata.processingTime,
        metadata: metadata.metadata || {},
      });

      return {
        success: true,
        transcription,
        metadata,
        timestamp: new Date(),
        savedTranscriptionId: savedTranscription._id,
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
