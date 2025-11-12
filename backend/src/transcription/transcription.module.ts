import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

// Importa la interfaz y los dos adaptadores
import { TRANSCRIPTOR_SERVICE } from './transcription.interface';
import { OpenAiAdapter } from './adapters/openai.adapter';
import { LocalAdapter } from './adapters/local.adapter';
import { TranscriptionService } from './transcription.service';
import {
  Transcription,
  TranscriptionSchema,
} from './schemas/transcription.schema';

@Module({
  imports: [
    ConfigModule, // Para leer el .env
    HttpModule, // Para el LocalAdapter
    MongooseModule.forFeature([
      { name: Transcription.name, schema: TranscriptionSchema },
    ]),
  ],
  providers: [
    // 1. Provee ambas implementaciones concretas
    OpenAiAdapter,
    LocalAdapter,
    TranscriptionService,

    // 2. El "Interruptor" Dinámico (El Factory)
    {
      provide: TRANSCRIPTOR_SERVICE,
      inject: [ConfigService, OpenAiAdapter, LocalAdapter],
      useFactory: (
        config: ConfigService,
        cloudAdapter: OpenAiAdapter,
        localAdapter: LocalAdapter,
      ) => {
        const mode = config.get<string>('TRANSCRIPTION_MODE', 'LOCAL');

        if (mode === 'LOCAL') {
          console.log('🔄 Modo de transcripción: LOCAL (máquina local)');
          return localAdapter;
        }

        console.log('🔄 Modo de transcripción: CLOUD (OpenAI Whisper)');
        return cloudAdapter;
      },
    },
  ],
  exports: [
    TRANSCRIPTOR_SERVICE, // Exporta el token para que otros módulos lo usen
    TranscriptionService, // Exporta el servicio de transcripción
  ],
})
export class TranscriptionModule {}
