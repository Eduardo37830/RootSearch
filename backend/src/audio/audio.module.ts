import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TranscriptionModule } from '../transcription/transcription.module';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';

@Module({
  imports: [
    TranscriptionModule,
    // Configura Multer para guardar archivos en carpeta temporal
    MulterModule.register({
      dest: './uploads', // Carpeta donde se guardarán los audios
    }),
  ],
  controllers: [AudioController],
  providers: [AudioService],
  exports: [AudioService, TranscriptionModule],
})
export class AudioModule {}
