import { ApiProperty } from '@nestjs/swagger';

export class TeacherCourseInfoDto {
  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Introducción a la Programación',
  })
  courseName: string;

  @ApiProperty({
    description: 'Nombre del profesor',
    example: 'Dr. Juan Pérez',
  })
  teacherName: string;

  @ApiProperty({
    description: 'Correo del profesor',
    example: 'juan.perez@universidad.edu',
  })
  teacherEmail: string;
}
