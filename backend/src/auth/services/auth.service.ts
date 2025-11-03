import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel
      .findOne({ email })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .exec();

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar código de verificación
    const verifyCode = await this.generateVerifyCode(user._id.toString());

    // Enviar código por correo electrónico
    try {
      await this.emailService.sendVerificationCode(
        user.email,
        verifyCode,
        user.name,
      );
    } catch (error) {
      console.error('Error al enviar email:', error);
      // No lanzamos error aquí para no bloquear el login
      // pero podrías manejarlo de otra forma según tus necesidades
    }

    // No devolvemos el token JWT todavía
    // El usuario debe verificar el código primero
    return {
      message: 'Código de verificación enviado a tu correo electrónico',
      email: user.email,
      requiresVerification: true,
    };
  }

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Buscar el rol "estudiante" por defecto
    let estudianteRole = await this.roleModel
      .findOne({ name: 'estudiante' })
      .exec();

    // Si no existe, crear el rol básico de estudiante
    if (!estudianteRole) {
      estudianteRole = await this.roleModel.create({
        name: 'estudiante',
        description: 'Estudiante del sistema',
        permissions: [],
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear el usuario
    const newUser = await this.userModel.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      roles: [estudianteRole._id],
    });

    // Generar código de verificación
    const verifyCode = await this.generateVerifyCode((newUser._id as any).toString());

    // Enviar email de bienvenida con código de verificación
    try {
      await this.emailService.sendWelcomeEmail(
        newUser.email,
        verifyCode,
        newUser.name,
      );
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      // No lanzamos error para no bloquear el registro
    }

    // No devolvemos el password ni información sensible
    return {
      message: 'Usuario registrado exitosamente. Código de verificación enviado a tu correo electrónico.',
      email: newUser.email,
      name: newUser.name,
      requiresVerification: true,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .select('-password')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .exec();
  }

  async generateVerifyCode(userId: string): Promise<number> {
    const verifyCode = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
    const verifyCodeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.userModel.findByIdAndUpdate(userId, {
      verifyCode,
      verifyCodeExpiration,
    });

    return verifyCode;
  }

  async verifyCode(email: string, code: number) {
    const user = await this.userModel
      .findOne({ email })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .exec();

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.verifyCode !== code) {
      throw new UnauthorizedException('Código de verificación inválido');
    }

    if (user.verifyCodeExpiration && user.verifyCodeExpiration < new Date()) {
      throw new UnauthorizedException('Código de verificación expirado');
    }

    // Limpiar el código después de verificarlo
    await this.userModel.findByIdAndUpdate(user._id, {
      $unset: { verifyCode: '', verifyCodeExpiration: '' },
    });

    // Ahora sí generar el token JWT
    const roles = user.roles.map((role: any) => role.name);
    const permissions = user.roles.flatMap((role: any) =>
      role.permissions.map((perm: any) => ({
        name: perm.name,
        method: perm.method,
      })),
    );

    const payload = {
      email: user.email,
      name: user.name,
      roles: roles,
      permissions: permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: roles,
      },
    };
  }

  async sendVerificationCode(email: string, code: number) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
  }
}
