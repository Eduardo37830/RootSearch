import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TranscriptionDocument = Transcription & Document;

@Schema({ timestamps: true })
export class Transcription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop()
  originalFileName: string;

  @Prop()
  fileSize: number;

  @Prop({ default: 'es' })
  language: string;

  @Prop()
  processingTime: number; // en ms

  @Prop({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const TranscriptionSchema = SchemaFactory.createForClass(Transcription);

// Índices para mejorar rendimiento
TranscriptionSchema.index({ userId: 1 });
TranscriptionSchema.index({ courseId: 1 });
TranscriptionSchema.index({ createdAt: -1 });
TranscriptionSchema.index({ userId: 1, createdAt: -1 });
TranscriptionSchema.index({ courseId: 1, createdAt: -1 });
TranscriptionSchema.index({ status: 1 });
