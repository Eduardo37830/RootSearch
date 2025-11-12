import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AudioService } from './audio.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Controlador para gestionar transcripción de archivos de audio
 *
 * Endpoints:
 * - POST /audio/transcribe - Transcribe un archivo de audio
 * - GET /audio/health - Verifica el estado del servicio de transcripción
 */
@Controller('audio')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  /**
   * Endpoint para transcribir un archivo de audio
   *
   * @route POST /audio/transcribe
   * @param file - Archivo de audio (multipart/form-data)
   * @param user - Usuario autenticado (inyectado por decorador)
   * @returns {
   *   success: boolean,
   *   transcription: string,
   *   language: string,
   *   fileName: string,
   *   processingTime: number (ms),
   *   timestamp: ISO string
   * }
   *
   * @example
   * POST /audio/transcribe
   * Headers: Authorization: Bearer {jwt_token}
   * Body: form-data
   *   - audio: [file.mp3]
   *   - language: es (optional, default: es)
   */
  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(@UploadedFile() file: any, @CurrentUser() user: any) {
    const startTime = Date.now();

    // Validación: archivo presente
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de audio');
    }

    // Validación: tipos de archivo permitidos
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/flac',
      'audio/m4a',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      // Limpia el archivo temporal
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(
        `Tipo de archivo no soportado. Tipos permitidos: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Validación: tamaño máximo (25MB para OpenAI, 100MB local)
    const maxFileSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxFileSize) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(
        `Archivo demasiado grande. Máximo permitido: 25MB. Recibido: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    try {
      console.log(
        `📁 Archivo recibido: ${file.filename} (${file.size} bytes) del usuario ${user.id}`,
      );

      // ⭐ CAMBIO CLAVE: Pasamos la ruta del archivo, no el stream
      // Multer ya guardó el archivo en disk, así que usamos file.path
      const filePath = file.path;
      console.log(`📂 Ruta del archivo: ${filePath}`);

      // Transcribe el audio (usa LOCAL o CLOUD según .env)
      // Ahora pasamos la ruta (string) en lugar del stream
      const transcription = await this.audioService.transcribeAudio(
        filePath,
        'es', // Por defecto español, podrías hacer dinámico
      );

      const processingTime = Date.now() - startTime;

      console.log(
        `✅ Transcripción exitosa para ${user.id}: ${transcription.substring(0, 50)}...`,
      );

      return {
        success: true,
        transcription,
        language: 'es',
        fileName: file.originalname,
        fileSize: file.size,
        processingTime: `${processingTime}ms`,
        userId: user.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Error en transcripción: ${error.message}`);

      throw new InternalServerErrorException({
        success: false,
        error: 'Error durante la transcripción del audio',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
        hint:
          error.message.includes('local') || error.message.includes('conectand')
            ? '💡 Verifica que tu servidor local esté ejecutándose (Ollama, LMStudio, etc.)'
            : error.message.includes('OpenAI') || error.message.includes('API')
              ? '💡 Verifica tu OPENAI_API_KEY y conexión a internet'
              : undefined,
      });
    } finally {
      // Limpia el archivo temporal
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
          console.log(`🗑️ Archivo temporal eliminado: ${file.path}`);
        } catch (unlinkError) {
          console.warn(
            `⚠️ No se pudo eliminar archivo temporal: ${unlinkError.message}`,
          );
        }
      }
    }
  }

  /**
   * Health check del servicio de transcripción
   * Verifica la disponibilidad de los adaptadores
   *
   * @route GET /audio/health
   * @returns {
   *   status: 'ok' | 'degraded',
   *   mode: 'LOCAL' | 'CLOUD',
   *   local: { available: boolean, endpoint: string },
   *   cloud: { available: boolean },
   *   timestamp: ISO string
   * }
   */
  @Get('health')
  async healthCheck(@CurrentUser() user: any) {
    const mode = process.env.TRANSCRIPTION_MODE || 'LOCAL';
    const localEndpoint =
      process.env.LOCAL_TRANSCRIPTION_ENDPOINT ||
      'http://localhost:8000/api/transcribe';

    console.log(`🏥 Health check de transcripción por usuario ${user.id}`);

    const result = {
      status: 'ok',
      mode,
      local: {
        available: false,
        endpoint: localEndpoint,
      },
      cloud: {
        available: false,
      },
      timestamp: new Date().toISOString(),
    };

    // Verifica disponibilidad del servidor local
    if (mode === 'LOCAL') {
      try {
        const axios = require('axios');
        const response = await axios.get(
          `${localEndpoint.replace('/api/transcribe', '')}/health`,
          {
            timeout: 2000,
          },
        );
        if (response.status === 200) {
          result.local.available = true;
        }
      } catch (error) {
        result.status = 'degraded';
        result.local.available = false;
        console.warn(`⚠️ Servidor local no disponible: ${localEndpoint}`);
      }
    }

    // Verifica disponibilidad de OpenAI
    if (mode === 'CLOUD') {
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey && apiKey !== '') {
          result.cloud.available = true;
        } else {
          result.status = 'degraded';
          result.cloud.available = false;
          console.warn('⚠️ OPENAI_API_KEY no configurada');
        }
      } catch (error) {
        result.status = 'degraded';
        result.cloud.available = false;
      }
    }

    return result;
  }

  /**
   * Endpoint de prueba simple para verificar el controlador
   *
   * @route GET /audio/test
   * @returns { message: string, timestamp: ISO string }
   */
  @Get('test')
  async testEndpoint() {
    return {
      message: '🎤 AudioController funcionando correctamente',
      timestamp: new Date().toISOString(),
    };
  }
}
