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

  async findAll(transcriptionId?: string) {
    const filter = transcriptionId ? { transcriptionId } : {};
    return this.materialModel.find(filter).exec();
  }

  async findOne(id: string) {
    const material = await this.materialModel.findById(id).exec();
    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }
    return material;
  }

  async update(id: string, updateMaterialDto: any) {
    const updatedMaterial = await this.materialModel
      .findByIdAndUpdate(id, updateMaterialDto, { new: true })
      .exec();
    if (!updatedMaterial) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }
    return updatedMaterial;
  }

  async remove(id: string) {
    const deletedMaterial = await this.materialModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedMaterial) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }
    return deletedMaterial;
  }

}
