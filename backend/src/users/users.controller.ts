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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
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
      'Crea un nuevo usuario (Docente o Estudiante) en el sistema. Solo accesible por ADMIN.',
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

  @Get()
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
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description:
      'Actualiza la información de un usuario existente. Todos los campos son opcionales.',
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
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está en uso.',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
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
