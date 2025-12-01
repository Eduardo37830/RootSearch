import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import {
  GeneratedMaterial,
  GeneratedMaterialSchema,
} from './schemas/material.schema';
import {
  Transcription,
  TranscriptionSchema,
} from '../transcription/schemas/transcription.schema';
import { TranscriptionModule } from '../transcription/transcription.module';
import { ContentGenerationModule } from '../content-generation/content-generation.module';
import { PdfExporterService } from './services/pdf-exporter.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneratedMaterial.name, schema: GeneratedMaterialSchema },
      { name: Transcription.name, schema: TranscriptionSchema },
    ]),
    ContentGenerationModule,
    TranscriptionModule,
    AuthModule,
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService, PdfExporterService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
