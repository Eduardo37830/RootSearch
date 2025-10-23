import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from './enums/role.enum';
import { Permission } from './enums/permission.enum';

// Interface para simular un usuario (reemplazar con TypeORM/Prisma después)
interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
}

@Injectable()
export class AuthService {
  // Simulación de base de datos en memoria (REEMPLAZAR CON DB REAL)
  private users: User[] = [
    {
      id: 1,
      email: 'admin@example.com',
      password: '$2b$10$XqP0XJ.IgLfr0gYVhGOIxeMgIh.Qs1Y7jqBCxMmZwZ2X5n9mZ0sFu', // password: admin123
      name: 'Admin User',
      roles: [Role.ADMIN],
      permissions: [
        Permission.CREATE_USER,
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.MANAGE_PRODUCTS,
      ],
    },
    {
      id: 2,
      email: 'user@example.com',
      password: '$2b$10$XqP0XJ.IgLfr0gYVhGOIxeMgIh.Qs1Y7jqBCxMmZwZ2X5n9mZ0sFu', // password: admin123
      name: 'Regular User',
      roles: [Role.USER],
      permissions: [Permission.READ_USER],
    },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = this.users.find((u) => u.email === email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = this.users.find((u) => u.email === registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser: User = {
      id: this.users.length + 1,
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      roles: [Role.USER], // Por defecto es USER
      permissions: [Permission.READ_USER],
    };

    this.users.push(newUser);

    const { password, ...result } = newUser;
    return result;
  }

  async getProfile(userId: number) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password, ...result } = user;
    return result;
  }
}
