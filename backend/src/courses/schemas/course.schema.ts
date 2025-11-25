import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, required: false })
  piaa_syllabus: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher: User | Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  students: User[] | Types.ObjectId[];

  @Prop({ default: true })
  active: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Índices para mejorar rendimiento
CourseSchema.index({ teacher: 1 });
CourseSchema.index({ students: 1 });
CourseSchema.index({ name: 1 });
