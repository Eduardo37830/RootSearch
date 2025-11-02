import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Ingeniería de Software III',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del curso',
    example:
      'Curso avanzado de ingeniería de software con enfoque en arquitecturas modernas',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description:
      'ID del usuario que será el profesor del curso (debe tener rol DOCENTE)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  teacherId: string;

  @ApiProperty({
    description:
      'Array de IDs de estudiantes a inscribir en el curso (opcional)',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  studentIds?: string[];
}
