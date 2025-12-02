import { ApiProperty } from '@nestjs/swagger';
import { CourseMaterialType } from '../schemas/course-material.schema';

export class StudentCourseMaterialDto {
  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Programación Avanzada',
  })
  courseName: string;

  @ApiProperty({
    description: 'ID del curso',
    example: '69169f8f89f550d1c96c635d',
  })
  courseId: string;

  @ApiProperty({
    description: 'ID del material',
    example: '69169f8f89f550d1c96c635e',
  })
  materialId: string;

  @ApiProperty({
    description: 'Título del material',
    example: 'Clase 1 - Introducción',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Descripción del material',
    example: 'Material de introducción al curso',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Tipo de material',
    enum: CourseMaterialType,
    example: CourseMaterialType.PDF,
  })
  type: CourseMaterialType;

  @ApiProperty({
    description: 'Nombre de archivo original',
    example: 'clase1.pdf',
  })
  originalName: string;

  @ApiProperty({
    description: 'URL de acceso al material',
    example: 'https://drive.google.com/file/d/xxx/view',
  })
  storageRef: string;
}
