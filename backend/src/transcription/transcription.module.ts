import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Importa la interfaz y los dos adaptadores
import { TRANSCRIPTOR_SERVICE } from './transcription.interface';
import { OpenAiAdapter } from './adapters/openai.adapter';
import { LocalAdapter } from './adapters/local.adapter';

@Module({
  imports: [
    ConfigModule, // Para leer el .env
    HttpModule, // Para el LocalAdapter
  ],
  providers: [
    // 1. Provee ambas implementaciones concretas
    OpenAiAdapter,
    LocalAdapter,

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
  ],
})
export class TranscriptionModule {}
