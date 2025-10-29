import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { Method } from '../enums/method.enum';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    // Verificar si ya hay datos
    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    // 1. Crear Permisos
    const permissions = await this.createPermissions();

    // 2. Crear Roles
    const roles = await this.createRoles(permissions);

    // 3. Crear Usuarios
    await this.createUsers(roles);

    console.log('Database seeded successfully!');
  }

  private async createPermissions() {
    const permissionsData = [
      // Permisos de usuarios
      {
        name: 'create:user',
        description: 'Crear usuarios',
        method: Method.Post,
      },
      { name: 'read:user', description: 'Leer usuarios', method: Method.Get },
      {
        name: 'update:user',
        description: 'Actualizar usuarios',
        method: Method.Put,
      },
      {
        name: 'delete:user',
        description: 'Eliminar usuarios',
        method: Method.Delete,
      },

      // Permisos de documentos/recursos
      {
        name: 'create:document',
        description: 'Crear documentos',
        method: Method.Post,
      },
      {
        name: 'read:document',
        description: 'Leer documentos',
        method: Method.Get,
      },
      {
        name: 'update:document',
        description: 'Actualizar documentos',
        method: Method.Put,
      },
      {
        name: 'delete:document',
        description: 'Eliminar documentos',
        method: Method.Delete,
      },

      // Permisos de cursos
      {
        name: 'create:course',
        description: 'Crear cursos',
        method: Method.Post,
      },
      {
        name: 'read:course',
        description: 'Leer cursos',
        method: Method.Get,
      },
      {
        name: 'update:course',
        description: 'Actualizar cursos',
        method: Method.Put,
      },
      {
        name: 'delete:course',
        description: 'Eliminar cursos',
        method: Method.Delete,
      },

      // Permisos de calificaciones
      {
        name: 'create:grade',
        description: 'Crear calificaciones',
        method: Method.Post,
      },
      {
        name: 'read:grade',
        description: 'Leer calificaciones',
        method: Method.Get,
      },
      {
        name: 'update:grade',
        description: 'Actualizar calificaciones',
        method: Method.Put,
      },
    ];

    const createdPermissions =
      await this.permissionModel.insertMany(permissionsData);
    console.log(`✓ ${createdPermissions.length} permissions created`);
    return createdPermissions;
  }

  private async createRoles(permissions: PermissionDocument[]): Promise<any[]> {
    // Permisos para ESTUDIANTE
    const estudiantePermissions = permissions.filter((p) =>
      ['read:document', 'read:course', 'read:grade'].includes(p.name),
    );

    // Permisos para DOCENTE
    const docentePermissions = permissions.filter((p) =>
      [
        'read:user',
        'read:document',
        'create:document',
        'update:document',
        'read:course',
        'update:course',
        'create:grade',
        'read:grade',
        'update:grade',
      ].includes(p.name),
    );

    // Permisos para ADMINISTRADOR (todos)
    const administradorPermissions = permissions;

    const rolesData = [
      {
        name: 'estudiante',
        description:
          'Estudiante del sistema - puede ver documentos, cursos y calificaciones',
        permissions: estudiantePermissions.map((p) => p._id),
      },
      {
        name: 'docente',
        description:
          'Docente - puede gestionar documentos, cursos y calificaciones',
        permissions: docentePermissions.map((p) => p._id),
      },
      {
        name: 'administrador',
        description: 'Administrador con acceso completo al sistema',
        permissions: administradorPermissions.map((p) => p._id),
      },
    ];

    const createdRoles = await this.roleModel.insertMany(rolesData);
    console.log(`✓ ${createdRoles.length} roles created`);
    return createdRoles;
  }

  private async createUsers(roles: any[]) {
    const administradorRole = roles.find((r) => r.name === 'administrador');
    const estudianteRole = roles.find((r) => r.name === 'estudiante');
    const docenteRole = roles.find((r) => r.name === 'docente');

    if (!administradorRole || !estudianteRole || !docenteRole) {
      throw new Error('Roles not found');
    }

    const usersData = [
      {
        name: 'Administrador',
        email: 'admin@rootsearch.com',
        password: await bcrypt.hash('admin123', 10),
        roles: [administradorRole._id],
      },
      {
        name: 'Juan Diego',
        email: 'estudiante@rootsearch.com',
        password: await bcrypt.hash('estudiante123', 10),
        roles: [estudianteRole._id],
      },
      {
        name: 'Eduardo Villamil',
        email: 'docente@rootsearch.com',
        password: await bcrypt.hash('docente123', 10),
        roles: [docenteRole._id],
      },
    ];

    const createdUsers = await this.userModel.insertMany(usersData);
    console.log(`✓ ${createdUsers.length} users created`);
    return createdUsers;
  }
}
