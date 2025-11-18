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
import { ContentGenerationModule } from '../content-generation/content-generation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneratedMaterial.name, schema: GeneratedMaterialSchema },
      { name: Transcription.name, schema: TranscriptionSchema },
    ]),
    ContentGenerationModule,
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
