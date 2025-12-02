import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class GlosarioItemDto {
  @ApiProperty()
  @IsString()
  term: string;

  @ApiProperty()
  @IsString()
  definition: string;
}

class QuizItemDto {
  @ApiProperty()
  @IsString()
  pregunta: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  opciones: string[];

  @ApiProperty()
  @IsString()
  respuestaCorrecta: string;

  @ApiProperty()
  @IsString()
  justificacion: string;
}

export class UpdateMaterialDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resumen?: string;

  @ApiProperty({ type: [GlosarioItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlosarioItemDto)
  glosario?: GlosarioItemDto[];

  @ApiProperty({ type: [QuizItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizItemDto)
  quiz?: QuizItemDto[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklist?: string[];

  @ApiProperty({
    required: false,
    enum: ['PENDIENTE_REVISION', 'APROBADO', 'RECHAZADO'],
  })
  @IsOptional()
  @IsEnum(['PENDIENTE_REVISION', 'APROBADO', 'RECHAZADO'])
  estado?: string;
}
