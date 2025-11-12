import { IsOptional, IsString, IsEnum } from 'class-validator';

/**
 * DTO para la transcripción de audio
 */
export class TranscribeAudioDto {
  /**
   * Código de idioma ISO 639-1
   * Ejemplos: 'es', 'en', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'
   * @default 'es'
   */
  @IsOptional()
  @IsString()
  language?: string = 'es';

  /**
   * Contexto adicional para mejorar la transcripción
   * (usado solo en algunos adaptadores)
   */
  @IsOptional()
  @IsString()
  context?: string;
}

/**
 * DTO para la respuesta de transcripción
 */
export class TranscriptionResponseDto {
  success: boolean;
  transcription?: string;
  language?: string;
  fileName?: string;
  fileSize?: number;
  processingTime?: string;
  userId?: string;
  timestamp?: string;
  error?: string;
  details?: string;
  hint?: string;
}
