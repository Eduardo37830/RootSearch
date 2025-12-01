import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcription } from '../transcription/schemas/transcription.schema';
import { GeneratedMaterial } from './schemas/material.schema';
import {
  CONTENT_GENERATOR,
  IContentGenerator,
} from '../content-generation/adapters/content-generation.interface';
import { EmailService } from '../auth/services/email.service';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    @InjectModel(Transcription.name)
    private transcriptionModel: Model<Transcription>,
    @InjectModel(GeneratedMaterial.name)
    private materialModel: Model<GeneratedMaterial>,
    @Inject(CONTENT_GENERATOR) private contentGenerator: IContentGenerator,
    private emailService: EmailService,
  ) { }

  async generarTodoSecuencial(transcriptionId: string) {
    // 1. Buscar la transcripción existente
    const transcription = await this.transcriptionModel
      .findById(transcriptionId)
      .populate('userId')
      .populate('courseId');
    if (!transcription || !transcription.text) {
      throw new NotFoundException(
        'Transcripción no encontrada o sin texto listo',
      );
    }

    // 2. Crear material inicial
    const nuevoMaterial = new this.materialModel({
      transcriptionId: transcription._id,
      courseId: transcription.courseId,
      estado: 'GENERANDO',
    });
    await nuevoMaterial.save();

    const texto = transcription.text;
    const course = transcription.courseId as any;
    const syllabusContexto = course?.piaa_syllabus || '';

    try {
      // 3. Generar secuencialmente y guardar progreso
      const resumen = await this.contentGenerator.generarResumen(
        texto,
        syllabusContexto,
      );
      nuevoMaterial.resumen = resumen;
      await nuevoMaterial.save();

      const glosario = await this.contentGenerator.generarGlosario(
        texto,
        syllabusContexto,
      );
      nuevoMaterial.glosario = glosario;
      await nuevoMaterial.save();

      const quiz = await this.contentGenerator.generarQuiz(
        texto,
        syllabusContexto,
      );
      nuevoMaterial.quiz = quiz;
      await nuevoMaterial.save();

      const checklist = await this.contentGenerator.generarChecklist(
        texto,
        syllabusContexto,
      );
      nuevoMaterial.checklist = checklist;

      // Calcular alineación PIAA si existe syllabus
      if (syllabusContexto) {
        try {
          const alineacion = await this.contentGenerator.calcularAlineacion(
            texto,
            syllabusContexto,
          );
          nuevoMaterial.piaa_alignment = alineacion;
        } catch (e) {
          this.logger.warn('Error calculando alineación PIAA', e);
        }
      }

      nuevoMaterial.estado = 'PENDIENTE_REVISION';
      const savedMaterial = await nuevoMaterial.save();

      // --- 4. NUEVO: NOTIFICAR AL DOCENTE ---
      if (transcription.userId && (transcription.userId as any).email) {
        const teacherEmail = (transcription.userId as any).email;
        this.logger.log(`Enviando correo a: ${teacherEmail}`);
        await this.emailService.sendNotificationEmail(
          teacherEmail,
          '¡Tu material de estudio está listo! 📚',
          `Hemos terminado de procesar la clase. Ya puedes revisar el resumen, quiz y glosario generados.`,
        );
      }

      return savedMaterial;
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

  async findAll(transcriptionId?: string, user?: any) {
    const filter: any = {};
    if (transcriptionId) {
      filter.transcriptionId = transcriptionId;
    }

    // Filtro de privacidad para estudiantes
    if (user && user.roles && user.roles.includes('estudiante')) {
      filter.estado = 'PUBLICADO';
    }

    return this.materialModel.find(filter).exec();
  }

  async findByCourse(courseId: string, user: any) {
    const filter: any = { courseId };

    // Filtro de privacidad para estudiantes
    if (user && user.roles && user.roles.includes('estudiante')) {
      filter.estado = 'PUBLICADO';
    }

    return this.materialModel.find(filter).exec();
  }

  async findOne(id: string, user?: any) {
    const material = await this.materialModel.findById(id).exec();
    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }

    // Verificación de privacidad para estudiantes
    if (user && user.roles && user.roles.includes('estudiante')) {
      if (material.estado !== 'PUBLICADO') {
        throw new NotFoundException(`Material no disponible para estudiantes`);
      }
    }

    return material;
  }

  async publish(id: string) {
    const material = await this.materialModel.findById(id);
    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }
    material.estado = 'PUBLICADO';
    return material.save();
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
