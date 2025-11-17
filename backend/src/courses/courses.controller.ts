import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EnrollStudentsDto } from './dto/enroll-students.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('courses')
@ApiBearerAuth('JWT-auth')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('ADMIN', 'DOCENTE') // Admin o Docente pueden crear cursos
  @ApiOperation({
    summary: 'Crear un nuevo curso',
    description:
      'Crea un nuevo curso en el sistema. Accesible por ADMIN y DOCENTE. El profesor debe tener rol DOCENTE.',
  })
  @ApiResponse({
    status: 201,
    description: 'Curso creado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o el profesor no tiene rol DOCENTE.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profesor o estudiantes no encontrados.',
  })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Roles('ADMIN', 'DOCENTE', 'ESTUDIANTE') // Todos los roles autenticados pueden ver cursos
  @ApiOperation({
    summary: 'Obtener todos los cursos',
    description:
      'Obtiene la lista de todos los cursos. Se puede filtrar por profesor o estudiante usando parámetros query.',
  })
  @ApiQuery({
    name: 'teacher',
    required: false,
    description: 'Filtrar cursos por ID del profesor',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'student',
    required: false,
    description: 'Filtrar cursos por ID del estudiante',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos obtenida exitosamente.',
  })
  findAll(
    @Query('teacher') teacherId?: string,
    @Query('student') studentId?: string,
  ) {
    if (teacherId) {
      return this.coursesService.findByTeacher(teacherId);
    }
    if (studentId) {
      return this.coursesService.findByStudent(studentId);
    }
    return this.coursesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCENTE', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Obtener un curso por ID',
    description:
      'Obtiene la información detallada de un curso específico, incluyendo profesor y estudiantes.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCENTE') // Admin o Docente pueden actualizar cursos
  @ApiOperation({
    summary: 'Actualizar un curso',
    description:
      'Actualiza la información de un curso existente. Todos los campos son opcionales.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a actualizar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso actualizado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado.',
  })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Post(':id/enroll')
  @Roles('ADMIN', 'DOCENTE') // Admin o Docente pueden inscribir estudiantes
  @ApiOperation({
    summary: 'Inscribir estudiantes en un curso',
    description:
      'Inscribe uno o más estudiantes en el curso. Los estudiantes deben tener rol ESTUDIANTE. Evita duplicados automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Estudiantes inscritos exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o estudiantes no tienen rol ESTUDIANTE.',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso o estudiantes no encontrados.',
  })
  enrollStudents(
    @Param('id') id: string,
    @Body() enrollStudentsDto: EnrollStudentsDto,
  ) {
    return this.coursesService.enrollStudents(id, enrollStudentsDto);
  }

  @Post(':id/unenroll')
  @Roles('ADMIN', 'DOCENTE') // Admin o Docente pueden desinscribir estudiantes
  @ApiOperation({
    summary: 'Desinscribir estudiantes de un curso',
    description: 'Remueve uno o más estudiantes del curso.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Estudiantes desinscritos exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado.',
  })
  unenrollStudents(
    @Param('id') id: string,
    @Body() enrollStudentsDto: EnrollStudentsDto,
  ) {
    return this.coursesService.unenrollStudents(id, enrollStudentsDto);
  }

  @Delete(':id')
  @Roles('ADMIN') // Solo Admin puede eliminar cursos
  @ApiOperation({
    summary: 'Eliminar un curso',
    description:
      'Elimina un curso del sistema de forma permanente. Solo accesible por ADMIN.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a eliminar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso eliminado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado.',
  })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Get('by-teacher/:teacherId')
  @Roles('ADMIN', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener cursos por ID del profesor',
    description: 'Devuelve los cursos asociados a un profesor específico.',
  })
  @ApiParam({
    name: 'teacherId',
    required: true,
    description: 'ID del profesor para filtrar los cursos',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos obtenida exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron cursos para el profesor dado.',
  })
  getCoursesByTeacher(@Param('teacherId') teacherId: string) {
    return this.coursesService.findByTeacher(teacherId);
  }
}
