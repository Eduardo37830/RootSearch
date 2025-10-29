import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Permissions } from './decorators/permissions.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Retorna token JWT y datos del usuario.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente con rol de estudiante.',
  })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario con roles y permisos.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  // Ejemplo: Solo administradores
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Endpoint solo para administradores' })
  @ApiResponse({
    status: 200,
    description: 'Acceso permitido para administradores.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Rol insuficiente',
  })
  adminOnly() {
    return { message: 'Solo administradores pueden ver esto' };
  }

  // Ejemplo: Docentes y Administradores
  @Get('docentes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('docente', 'administrador')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Área de docentes - Gestión de cursos' })
  @ApiResponse({
    status: 200,
    description: 'Acceso para docentes y administradores.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  docenteArea() {
    return { message: 'Área de docentes - gestión de cursos' };
  }

  // Ejemplo: Endpoint con permiso específico
  @Get('create-course')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('create:course')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear curso - Requiere permiso específico' })
  @ApiResponse({
    status: 200,
    description: 'Usuario tiene permiso para crear cursos.',
  })
  @ApiResponse({ status: 403, description: 'Permiso insuficiente' })
  createCourse() {
    return { message: 'Tienes permiso para crear cursos' };
  }

  // Ejemplo: Todos los roles autenticados
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Dashboard - Para todos los usuarios autenticados' })
  @ApiResponse({ status: 200, description: 'Dashboard del usuario.' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  dashboard(@CurrentUser() user: any) {
    return {
      message: `Bienvenido ${user.name}`,
      role: user.roles[0],
    };
  }
}
