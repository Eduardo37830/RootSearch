import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReadStream } from 'fs';
import * as fs from 'fs';
import { ITranscriptor } from '../transcription.interface';

@Injectable()
export class OpenAiAdapter implements ITranscriptor {
  private openai: any;

  constructor(private configService: ConfigService) {
    try {
      // Importamos dinámicamente OpenAI para evitar errores si no está instalado
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const OpenAI = require('openai').default;
      this.openai = new OpenAI({
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      });
    } catch (error) {
      console.warn(
        '⚠️ Advertencia: OpenAI no está instalado. Instala con: npm install openai',
      );
    }
  }

  async transcribir(
    audioInput: ReadStream | string,
    lang: string,
  ): Promise<string> {
    console.log('🌐 Usando Adaptador CLOUD: OpenAI Whisper API');

    if (!this.openai) {
      throw new Error(
        'OpenAI no está configurado. Instala el paquete: npm install openai',
      );
    }

    try {
      let fileToSend: ReadStream;

      // Si recibimos una ruta (string), abrimos el archivo
      if (typeof audioInput === 'string') {
        console.log(`📂 Leyendo archivo: ${audioInput}`);
        fileToSend = fs.createReadStream(audioInput);
      } else {
        // Si recibimos un ReadStream, lo usamos directamente
        fileToSend = audioInput;
      }

      const response = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: fileToSend,
        language: lang,
        response_format: 'text',
      });
      return response as string;
    } catch (error) {
      console.error('Error al transcribir con OpenAI:', error.message);
      throw error;
    }
  }
}
