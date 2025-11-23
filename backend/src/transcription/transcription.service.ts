import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transcription,
  TranscriptionDocument,
} from './schemas/transcription.schema';

export interface CreateTranscriptionDto {
  userId: string | Types.ObjectId;
  courseId: string | Types.ObjectId;
  text: string;
  originalFileName?: string;
  fileSize?: number;
  language?: string;
  processingTime?: number;
  metadata?: Record<string, any>;
}

export interface UpdateTranscriptionDto {
  text?: string;
  status?: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  processingTime?: number;
}

@Injectable()
export class TranscriptionService {
  constructor(
    @InjectModel(Transcription.name)
    private transcriptionModel: Model<TranscriptionDocument>,
  ) {}

  /**
   * Crea y guarda una nueva transcripción en MongoDB
   */
  async create(
    createTranscriptionDto: CreateTranscriptionDto,
  ): Promise<TranscriptionDocument> {
    const createdTranscription = new this.transcriptionModel({
      ...createTranscriptionDto,
      userId: new Types.ObjectId(createTranscriptionDto.userId),
      courseId: new Types.ObjectId(createTranscriptionDto.courseId),
      status: 'completed',
    });

    return createdTranscription.save();
  }

  /**
   * Obtiene todas las transcripciones de un usuario
   */
  async findByUserId(
    userId: string | Types.ObjectId,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{
    data: TranscriptionDocument[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const objectId = new Types.ObjectId(userId);

    const [data, total] = await Promise.all([
      this.transcriptionModel
        .find({ userId: objectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transcriptionModel.countDocuments({ userId: objectId }),
    ]);

    return {
      data,
      total,
      skip,
      limit,
    };
  }

  /**
   * Obtiene una transcripción por ID
   */
  async findById(
    id: string | Types.ObjectId,
  ): Promise<TranscriptionDocument | null> {
    return this.transcriptionModel.findById(new Types.ObjectId(id)).exec();
  }

  /**
   * Actualiza una transcripción
   */
  async update(
    id: string | Types.ObjectId,
    updateTranscriptionDto: UpdateTranscriptionDto,
  ): Promise<TranscriptionDocument | null> {
    return this.transcriptionModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: updateTranscriptionDto },
        { new: true },
      )
      .exec();
  }

  /**
   * Elimina una transcripción
   */
  async remove(
    id: string | Types.ObjectId,
  ): Promise<TranscriptionDocument | null> {
    return this.transcriptionModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();
  }

  /**
   * Obtiene estadísticas de transcripciones de un usuario
   */
  async getStats(userId: string | Types.ObjectId): Promise<{
    totalTranscriptions: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    languagesUsed: string[];
  }> {
    const objectId = new Types.ObjectId(userId);

    const stats = await this.transcriptionModel.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: null,
          totalTranscriptions: { $sum: 1 },
          totalProcessingTime: { $sum: '$processingTime' },
          averageProcessingTime: { $avg: '$processingTime' },
          languages: { $push: '$language' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalTranscriptions: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        languagesUsed: [],
      };
    }

    const stat = stats[0];
    return {
      totalTranscriptions: stat.totalTranscriptions,
      totalProcessingTime: stat.totalProcessingTime,
      averageProcessingTime: Math.round(stat.averageProcessingTime),
      languagesUsed: [...new Set(stat.languages)] as string[],
    };
  }

  /**
   * Busca transcripciones por texto
   */
  async search(
    userId: string | Types.ObjectId,
    query: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{
    data: TranscriptionDocument[];
    total: number;
  }> {
    const objectId = new Types.ObjectId(userId);

    const [data, total] = await Promise.all([
      this.transcriptionModel
        .find({
          userId: objectId,
          $text: { $search: query },
        })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transcriptionModel.countDocuments({
        userId: objectId,
        $text: { $search: query },
      }),
    ]);

    return { data, total };
  }

  /**
   * Obtiene todas las transcripciones de un curso específico
   */
  async findByCourseId(
    courseId: string | Types.ObjectId,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{
    data: TranscriptionDocument[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const objectId = new Types.ObjectId(courseId);

    const [data, total] = await Promise.all([
      this.transcriptionModel
        .find({ courseId: objectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .exec(),
      this.transcriptionModel.countDocuments({ courseId: objectId }),
    ]);

    return {
      data,
      total,
      skip,
      limit,
    };
  }

  /**
   * Obtiene todas las transcripciones de un usuario en un curso específico
   */
  async findByUserAndCourse(
    userId: string | Types.ObjectId,
    courseId: string | Types.ObjectId,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{
    data: TranscriptionDocument[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(courseId);

    const [data, total] = await Promise.all([
      this.transcriptionModel
        .find({ userId: userObjectId, courseId: courseObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transcriptionModel.countDocuments({
        userId: userObjectId,
        courseId: courseObjectId,
      }),
    ]);

    return {
      data,
      total,
      skip,
      limit,
    };
  }

  /**
   * Obtiene estadísticas de transcripciones de un curso
   */
  async getCourseStats(courseId: string | Types.ObjectId): Promise<{
    totalTranscriptions: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    totalUsers: number;
  }> {
    const objectId = new Types.ObjectId(courseId);

    const stats = await this.transcriptionModel.aggregate([
      { $match: { courseId: objectId } },
      {
        $group: {
          _id: null,
          totalTranscriptions: { $sum: 1 },
          totalProcessingTime: { $sum: '$processingTime' },
          averageProcessingTime: { $avg: '$processingTime' },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          totalTranscriptions: 1,
          totalProcessingTime: 1,
          averageProcessingTime: { $round: ['$averageProcessingTime', 0] },
          totalUsers: { $size: '$uniqueUsers' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalTranscriptions: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        totalUsers: 0,
      };
    }

    return stats[0];
  }
}
