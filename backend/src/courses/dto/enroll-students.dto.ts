import { IsMongoId, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollStudentsDto {
  @ApiProperty({
    description:
      'Array de IDs de estudiantes a inscribir o desinscribir del curso',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  studentIds: string[];
}
