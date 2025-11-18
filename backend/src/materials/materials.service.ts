import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcription } from '../transcription/schemas/transcription.schema';
import { GeneratedMaterial } from './schemas/material.schema';
import {
  CONTENT_GENERATOR,
  IContentGenerator,
} from '../content-generation/content-generation.interface';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectModel(Transcription.name)
    private transcriptionModel: Model<Transcription>,
    @InjectModel(GeneratedMaterial.name)
    private materialModel: Model<GeneratedMaterial>,
    @Inject(CONTENT_GENERATOR) private contentGenerator: IContentGenerator,
  ) {}

  async generateAndSave(transcriptionId: string) {
    // 1. Buscar la transcripción existente
    const transcription =
      await this.transcriptionModel.findById(transcriptionId);
    if (!transcription || !transcription.text) {
      throw new NotFoundException(
        'Transcripción no encontrada o sin texto listo',
      );
    }

    // 2. Llamar a tu módulo de IA (Ollama/LM Studio/OpenAI)
    const contenidoGenerado = await this.contentGenerator.generarMaterial(
      transcription.text,
    );

    // 3. Guardar en la colección de Materiales
    const nuevoMaterial = new this.materialModel({
      transcriptionId: transcription._id,
      resumen: contenidoGenerado.resumen,
      glosario: contenidoGenerado.glosario,
      quiz: contenidoGenerado.quiz,
      checklist: contenidoGenerado.checklist,
      estado: 'PENDIENTE_REVISION', // El docente debe aprobarlo luego
    });

    return nuevoMaterial.save();
  }
}
