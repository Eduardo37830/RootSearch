import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class GeneratedMaterial extends Document {
  @ApiProperty({ description: 'ID de la transcripción asociada' })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Transcription',
    required: true,
  })
  transcriptionId: string;

  @ApiProperty({ description: 'ID del curso asociado' })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  courseId: string;

  @ApiProperty({ description: 'Resumen generado en formato Markdown' })
  @Prop()
  resumen: string;

  @ApiProperty({
    description: 'Glosario de términos',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        term: { type: 'string' },
        definition: { type: 'string' },
      },
    },
  })
  @Prop({ type: [{ term: String, definition: String, _id: false }] })
  glosario: { term: string; definition: string }[];

  @ApiProperty({
    description: 'Quiz generado',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        pregunta: { type: 'string' },
        opciones: { type: 'array', items: { type: 'string' } },
        respuestaCorrecta: { type: 'string' },
        justificacion: { type: 'string' },
      },
    },
  })
  @Prop({
    type: [
      {
        pregunta: String,
        opciones: [String],
        respuestaCorrecta: String,
        justificacion: String,
        _id: false,
      },
    ],
  })
  quiz: {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: string;
    justificacion: string;
  }[];

  @ApiProperty({ description: 'Lista de verificación de conceptos' })
  @Prop([String])
  checklist: string[];

  @ApiPropertyOptional({
    description: 'Alineación con el PIAA (Syllabus)',
    type: 'object',
    properties: {
      score: { type: 'number', description: 'Puntaje de 0 a 100' },
      analisis: { type: 'string', description: 'Explicación de la alineación' },
    },
  })
  @Prop({
    type: {
      score: Number,
      analisis: String,
    },
    _id: false,
  })
  piaa_alignment?: {
    score: number;
    analisis: string;
  };

  @ApiProperty({
    description: 'Estado del material',
    default: 'PENDIENTE_REVISION',
  })
  @Prop({ default: 'PENDIENTE_REVISION' })
  estado: string;
}

export const GeneratedMaterialSchema =
  SchemaFactory.createForClass(GeneratedMaterial);
