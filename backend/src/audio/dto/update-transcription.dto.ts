import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateTranscriptionDto {
  @ApiProperty({
    required: false,
    description: 'Texto corregido de la transcripción',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ required: false, enum: ['pending', 'completed', 'failed'] })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed'])
  status?: 'pending' | 'completed' | 'failed';
}
