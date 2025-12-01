import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LmStudioAdapter } from './adapters/lm-studio.adapter';
import { CONTENT_GENERATOR } from './adapters/content-generation.interface';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: CONTENT_GENERATOR,
      useClass: LmStudioAdapter, // Aquí defines que usarás LM Studio
    },
  ],
  exports: [CONTENT_GENERATOR], // Exportas la interfaz para que otros la usen
})
export class ContentGenerationModule { }
