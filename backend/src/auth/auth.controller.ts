import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Permissions } from './decorators/permissions.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  // Ejemplo: Solo administradores
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  adminOnly() {
    return { message: 'Solo administradores pueden ver esto' };
  }

  // Ejemplo: Docentes y Administradores
  @Get('docentes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('docente', 'administrador')
  docenteArea() {
    return { message: 'Área de docentes - gestión de cursos' };
  }

  // Ejemplo: Endpoint con permiso específico
  @Get('create-course')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('create:course')
  createCourse() {
    return { message: 'Tienes permiso para crear cursos' };
  }

  // Ejemplo: Todos los roles autenticados
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  dashboard(@CurrentUser() user: any) {
    return {
      message: `Bienvenido ${user.name}`,
      role: user.roles[0],
    };
  }
}
