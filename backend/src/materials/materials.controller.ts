import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('materials')
@ApiBearerAuth('JWT-auth')
@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // Endpoint específico para disparar la generación
  @Post('generate/:transcriptionId')
  @Roles('administrador', 'docente')
  @ApiOperation({
    summary: 'Generar material de estudio a partir de una transcripción',
  })
  @ApiParam({ name: 'transcriptionId', description: 'ID de la transcripción' })
  @ApiResponse({ status: 201, description: 'Material generado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Transcripción no encontrada.' })
  async generateMaterials(@Param('transcriptionId') transcriptionId: string) {
    return this.materialsService.generateAndSave(transcriptionId);
  }
}
