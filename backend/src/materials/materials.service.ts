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

  async generarTodoSecuencial(transcriptionId: string) {
    // 1. Buscar la transcripción existente
    const transcription =
      await this.transcriptionModel.findById(transcriptionId);
    if (!transcription || !transcription.text) {
      throw new NotFoundException(
        'Transcripción no encontrada o sin texto listo',
      );
    }

    // 2. Crear material inicial
    const nuevoMaterial = new this.materialModel({
      transcriptionId: transcription._id,
      estado: 'GENERANDO',
    });
    await nuevoMaterial.save();

    const texto = transcription.text;

    try {
      // 3. Generar secuencialmente y guardar progreso
      const resumen = await this.contentGenerator.generarResumen(texto);
      nuevoMaterial.resumen = resumen;
      await nuevoMaterial.save();

      const glosario = await this.contentGenerator.generarGlosario(texto);
      nuevoMaterial.glosario = glosario;
      await nuevoMaterial.save();

      const quiz = await this.contentGenerator.generarQuiz(texto);
      nuevoMaterial.quiz = quiz;
      await nuevoMaterial.save();

      const checklist = await this.contentGenerator.generarChecklist(texto);
      nuevoMaterial.checklist = checklist;

      nuevoMaterial.estado = 'PENDIENTE_REVISION';
      return await nuevoMaterial.save();
    } catch (error) {
      nuevoMaterial.estado = 'ERROR_GENERACION';
      await nuevoMaterial.save();
      throw error;
    }
  }

  async generarSoloResumen(materialId: string) {
    const material = await this.materialModel
      .findById(materialId)
      .populate('transcriptionId');
    if (!material) throw new NotFoundException('Material no encontrado');

    const transcription = material.transcriptionId as any;
    const texto = transcription.text;

    const resumen = await this.contentGenerator.generarResumen(texto);
    material.resumen = resumen;
    return material.save();
  }

  async generarSoloQuiz(materialId: string) {
    const material = await this.materialModel
      .findById(materialId)
      .populate('transcriptionId');
    if (!material) throw new NotFoundException('Material no encontrado');

    const transcription = material.transcriptionId as any;
    const texto = transcription.text;

    const quiz = await this.contentGenerator.generarQuiz(texto);
    material.quiz = quiz;
    return material.save();
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
