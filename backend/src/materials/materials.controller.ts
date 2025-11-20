import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Patch,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('materials')
@ApiBearerAuth('JWT-auth')
@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // 1. Generar SOLO Resumen
  @Post(':id/resumen')
  @Roles('administrador', 'docente')
  @ApiOperation({
    summary: 'Regenerar solo el resumen de un material existente',
  })
  async generateResumen(@Param('id') id: string) {
    return this.materialsService.generarSoloResumen(id);
  }

  // 2. Generar SOLO Quiz
  @Post(':id/quiz')
  @Roles('administrador', 'docente')
  @ApiOperation({ summary: 'Regenerar solo el quiz de un material existente' })
  async generateQuiz(@Param('id') id: string) {
    return this.materialsService.generarSoloQuiz(id);
  }

  // 3. Endpoint "Maestro" (Llama a todos internamente)
  @Post('generate-all/:transcriptionId')
  @Roles('administrador', 'docente')
  @ApiOperation({
    summary: 'Generar todo el material de estudio secuencialmente',
  })
  @ApiParam({ name: 'transcriptionId', description: 'ID de la transcripción' })
  @ApiResponse({ status: 201, description: 'Material generado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Transcripción no encontrada.' })
  async generateAll(@Param('transcriptionId') transcriptionId: string) {
    return this.materialsService.generarTodoSecuencial(transcriptionId);
  }

  @Get()
  @Roles('administrador', 'docente', 'estudiante')
  @ApiOperation({ summary: 'Obtener todos los materiales generados' })
  @ApiQuery({
    name: 'transcriptionId',
    required: false,
    description: 'Filtrar por ID de transcripción',
  })
  @ApiResponse({ status: 200, description: 'Lista de materiales.' })
  findAll(@Query('transcriptionId') transcriptionId?: string) {
    return this.materialsService.findAll(transcriptionId);
  }

  @Get(':id')
  @Roles('administrador', 'docente', 'estudiante')
  @ApiOperation({ summary: 'Obtener un material por ID' })
  @ApiParam({ name: 'id', description: 'ID del material' })
  @ApiResponse({ status: 200, description: 'Material encontrado.' })
  @ApiResponse({ status: 404, description: 'Material no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'docente')
  @ApiOperation({ summary: 'Actualizar un material' })
  @ApiParam({ name: 'id', description: 'ID del material' })
  @ApiResponse({ status: 200, description: 'Material actualizado.' })
  @ApiResponse({ status: 404, description: 'Material no encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @Roles('administrador', 'docente')
  @ApiOperation({ summary: 'Eliminar un material' })
  @ApiParam({ name: 'id', description: 'ID del material' })
  @ApiResponse({ status: 200, description: 'Material eliminado.' })
  @ApiResponse({ status: 404, description: 'Material no encontrado.' })
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}
