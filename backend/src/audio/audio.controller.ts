import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AudioService } from './audio.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { UpdateTranscriptionDto } from './dto/update-transcription.dto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Controlador para gestionar transcripción de archivos de audio
 *
 * Endpoints:
 * - POST /audio/transcribe - Transcribe un archivo de audio
 * - GET /audio/health - Verifica el estado del servicio de transcripción
 */
@ApiTags('audio')
@ApiBearerAuth('JWT-auth')
@Controller('audio')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(
    private readonly audioService: AudioService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  /**
   * Endpoint para transcribir un archivo de audio
   */
  @Post('transcribe')
  @ApiOperation({ summary: 'Transcribir un archivo de audio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
        },
        courseId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Audio transcrito exitosamente.' })
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(
    @UploadedFile() file: any,
    @CurrentUser() user: any,
    @Body() body: any,
    @Query('courseId') queryCourseId?: string,
  ) {
    const startTime = Date.now();
    const courseId = queryCourseId || body.courseId;

    // Validación: archivo presente
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de audio');
    }

    // Validación: courseId presente
    if (!courseId) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(
        'El ID del curso (courseId) es requerido. Envíalo en el body o como query param ?courseId=...',
      );
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

      // Guarda la transcripción en MongoDB
      const savedTranscription = await this.transcriptionService.create({
        userId: user.id,
        courseId: courseId,
        text: transcription,
        originalFileName: file.originalname,
        fileSize: file.size,
        language: 'es',
        processingTime,
      });

      console.log(
        `💾 Transcripción guardada en MongoDB con ID: ${savedTranscription._id} para curso: ${courseId}`,
      );

      return {
        success: true,
        transcription,
        language: 'es',
        fileName: file.originalname,
        fileSize: file.size,
        processingTime: `${processingTime}ms`,
        userId: user.id,
        courseId: courseId,
        transcriptionId: savedTranscription._id,
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
   * Obtiene todas las transcripciones del usuario autenticado
   */
  @Get('transcriptions')
  @ApiOperation({ summary: 'Obtener todas las transcripciones del usuario' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista de transcripciones.' })
  async getTranscriptions(
    @CurrentUser() user: any,
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '10',
  ) {
    const skipNum = parseInt(skip, 10) || 0;
    const limitNum = parseInt(limit, 10) || 10;

    try {
      const result = await this.transcriptionService.findByUserId(
        user.id,
        skipNum,
        limitNum,
      );

      console.log(
        `📋 Obtenidas ${result.data.length} transcripciones del usuario ${user.id}`,
      );

      return {
        success: true,
        data: result.data,
        pagination: {
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Error obteniendo transcripciones: ${error.message}`);
      throw new InternalServerErrorException({
        success: false,
        error: 'Error al obtener transcripciones',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Obtiene una transcripción específica por ID
   */
  @Get('transcriptions/:id')
  @ApiOperation({ summary: 'Obtener una transcripción por ID' })
  @ApiParam({ name: 'id', description: 'ID de la transcripción' })
  @ApiResponse({ status: 200, description: 'Transcripción encontrada.' })
  @ApiResponse({ status: 404, description: 'Transcripción no encontrada.' })
  async getTranscriptionById(@Param('id') id: string) {
    try {
      const transcription = await this.transcriptionService.findById(id);

      if (!transcription) {
        throw new NotFoundException('Transcripción no encontrada');
      }

      console.log(`📄 Transcripción obtenida: ${id}`);

      return {
        success: true,
        data: transcription,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`❌ Error obteniendo transcripción: ${error.message}`);
      throw new InternalServerErrorException({
        success: false,
        error: 'Error al obtener transcripción',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Obtiene todas las transcripciones de un curso específico
   */
  @Get('courses/:courseId/transcriptions')
  @ApiOperation({ summary: 'Obtener transcripciones de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de transcripciones del curso.',
  })
  async getCourseTranscriptions(
    @Param('courseId') courseId: string,
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '10',
  ) {
    const skipNum = parseInt(skip, 10) || 0;
    const limitNum = parseInt(limit, 10) || 10;

    try {
      const result = await this.transcriptionService.findByCourseId(
        courseId,
        skipNum,
        limitNum,
      );

      console.log(
        `📋 Obtenidas ${result.data.length} transcripciones del curso ${courseId}`,
      );

      return {
        success: true,
        data: result.data,
        courseId,
        pagination: {
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `❌ Error obteniendo transcripciones del curso: ${error.message}`,
      );
      throw new InternalServerErrorException({
        success: false,
        error: 'Error al obtener transcripciones del curso',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  @Patch('transcriptions/:id')
  @ApiOperation({ summary: 'Actualizar una transcripción' })
  @ApiParam({ name: 'id', description: 'ID de la transcripción' })
  @ApiResponse({ status: 200, description: 'Transcripción actualizada.' })
  @ApiResponse({ status: 404, description: 'Transcripción no encontrada.' })
  async updateTranscription(
    @Param('id') id: string,
    @Body() updateTranscriptionDto: UpdateTranscriptionDto,
  ) {
    const updated = await this.transcriptionService.update(
      id,
      updateTranscriptionDto,
    );
    if (!updated) {
      throw new NotFoundException('Transcripción no encontrada');
    }
    return { success: true, data: updated };
  }

  @Delete('transcriptions/:id')
  @ApiOperation({ summary: 'Eliminar una transcripción' })
  @ApiParam({ name: 'id', description: 'ID de la transcripción' })
  @ApiResponse({ status: 200, description: 'Transcripción eliminada.' })
  @ApiResponse({ status: 404, description: 'Transcripción no encontrada.' })
  async removeTranscription(@Param('id') id: string) {
    const deleted = await this.transcriptionService.remove(id);
    if (!deleted) {
      throw new NotFoundException('Transcripción no encontrada');
    }
    return { success: true, data: deleted };
  }
}
