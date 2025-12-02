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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador') // Solo los administradores pueden acceder a estos endpoints
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema. Si no se especifica rol, se asigna ESTUDIANTE por defecto. Solo accesible por ADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o rol no existe.',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('my-teachers')
  @Roles('estudiante')
  @ApiOperation({
    summary: 'Obtener profesores de mis cursos (Solo Estudiantes)',
    description:
      'Obtiene la información de contacto de los profesores de todos los cursos en los que está inscrito el estudiante autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de profesores y cursos obtenida exitosamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Solo estudiantes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado.',
  })
  getMyTeachers(@CurrentUser() user: User) {
    return this.usersService.getMyTeachers((user as any).id);
  }

  @Get()
  @Roles('administrador', 'docente')
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description:
      'Obtiene la lista de todos los usuarios. Se puede filtrar por rol usando el parámetro query.',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filtrar usuarios por rol (DOCENTE o ESTUDIANTE)',
    example: 'DOCENTE',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente.',
  })
  findAll(@Query('role') role?: string) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'docente') // Admin y Docente pueden ver detalles de usuario
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description: 'Obtiene la información detallada de un usuario específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'docente', 'estudiante') // Todos los usuarios autenticados
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description:
      'Los usuarios pueden actualizar su propio perfil. Los administradores pueden actualizar cualquier usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a actualizar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para actualizar este usuario.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está en uso.',
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Verificar si el usuario está actualizando su propio perfil o si es admin
    const isAdmin = currentUser.roles?.includes('administrador');
    const isOwnProfile = currentUser.sub === id || currentUser.id === id;

    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este usuario',
      );
    }

    // Filtrar campos vacíos o undefined del DTO
    const cleanedDto: any = {};
    Object.keys(updateUserDto).forEach((key) => {
      const value = updateUserDto[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanedDto[key] = value;
      }
    });

    // Si no es admin y está intentando cambiar el rol, bloquear
    if (!isAdmin && cleanedDto.roleId) {
      throw new ForbiddenException('No tienes permiso para cambiar el rol');
    }

    return this.usersService.update(id, cleanedDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un usuario',
    description: 'Elimina un usuario del sistema de forma permanente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a eliminar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
