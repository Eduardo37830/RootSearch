import {
  IsOptional,
  IsString,
  IsMongoId,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Ingeniería de Software III - Actualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descripción del curso',
    example: 'Descripción actualizada del curso',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID del nuevo profesor (debe tener rol DOCENTE)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  teacherId?: string;

  @ApiProperty({
    description: 'Array de IDs de estudiantes (reemplaza la lista completa)',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  studentIds?: string[];

  @ApiProperty({
    description: 'Estado del curso (activo/inactivo)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
