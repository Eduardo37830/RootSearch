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
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { PdfExporterService } from './services/pdf-exporter.service';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('materials')
@ApiBearerAuth('JWT-auth')
@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly pdfExporter: PdfExporterService,
  ) {}

  @Post('upload-audio')
  @Roles('administrador', 'docente')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir audio, transcribir y generar materiales',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de audio y ID del curso',
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAudio(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('courseId') courseId: string,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.processAudioForCourse(
      file,
      courseId,
      user._id,
    );
  }

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

  @Get('course/:courseId')
  @Roles('administrador', 'docente', 'estudiante')
  @ApiOperation({ summary: 'Obtener todos los materiales de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Lista de materiales del curso.' })
  findByCourse(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.materialsService.findByCourse(courseId, user);
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
  findAll(
    @Query('transcriptionId') transcriptionId: string,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.findAll(transcriptionId, user);
  }

  @Get(':id')
  @Roles('administrador', 'docente', 'estudiante')
  @ApiOperation({ summary: 'Obtener un material por ID' })
  @ApiParam({ name: 'id', description: 'ID del material' })
  @ApiResponse({ status: 200, description: 'Material encontrado.' })
  @ApiResponse({ status: 404, description: 'Material no encontrado.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.materialsService.findOne(id, user);
  }

  @Patch(':id/publish')
  @Roles('administrador','docente')
  @ApiOperation({
    summary: 'Publicar un material para que sea visible por estudiantes',
  })
  @ApiParam({ name: 'id', description: 'ID del material' })
  @ApiResponse({ status: 200, description: 'Material publicado.' })
  publish(@Param('id') id: string) {
    return this.materialsService.publish(id);
  }

  @Get(':id/export/pdf')
  @Roles('administrador', 'docente', 'estudiante') // Todos pueden descargar
  @ApiOperation({ summary: 'Exportar material a PDF' })
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const material = await this.materialsService.findOne(id);

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    const pdfBuffer = await this.pdfExporter.generatePdf(material);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=RootSearch_${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
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
