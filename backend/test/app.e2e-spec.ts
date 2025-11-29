import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';
import { User } from '../src/auth/schemas/user.schema';
import { Role } from '../src/auth/schemas/role.schema';
import { Course } from '../src/courses/schemas/course.schema';
import { Permission } from '../src/auth/schemas/permission.schema';
import * as bcrypt from 'bcrypt';

describe('RootSearch E2E Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  // Tokens de autenticación
  let adminToken: string;
  let docenteToken: string;
  let estudianteToken: string;

  // Mocks de los modelos
  let mockUserModel: any;
  let mockRoleModel: any;
  let mockCourseModel: any;
  let mockPermissionModel: any;

  // Helper to create a chainable mock (scoped at file level so tests can use it)
  const chainable = (result: any) => {
    const chain: any = {
      exec: jest.fn().mockResolvedValue(result),
      populate: jest.fn(),
      select: jest.fn(),
    };
    chain.populate.mockImplementation(() => chain);
    chain.select.mockImplementation(() => chain);
    return chain;
  };

  // Datos de prueba
  const mockRoles = {
    admin: {
      _id: '507f1f77bcf86cd799439011',
      name: 'ADMIN',
      description: 'Administrador del sistema',
      permissions: [],
    },
    docente: {
      _id: '507f1f77bcf86cd799439012',
      name: 'DOCENTE',
      description: 'Docente',
      permissions: [{ name: 'create:course', method: 'POST' }],
    },
    estudiante: {
      _id: '507f1f77bcf86cd799439013',
      name: 'ESTUDIANTE',
      description: 'Estudiante',
      permissions: [],
    },
  };

  const mockUsers = {
    admin: {
      _id: '507f1f77bcf86cd799439021',
      name: 'Admin User',
      email: 'admin@test.com',
      password: '', // Se generará en beforeAll
      roles: [mockRoles.admin],
      toObject: function() { return { ...this, password: undefined }; },
    },
    docente: {
      _id: '507f1f77bcf86cd799439022',
      name: 'Docente User',
      email: 'docente@test.com',
      password: '', // Se generará en beforeAll
      roles: [mockRoles.docente],
      toObject: function() { return { ...this, password: undefined }; },
    },
    estudiante: {
      _id: '507f1f77bcf86cd799439023',
      name: 'Estudiante User',
      email: 'estudiante@test.com',
      password: '', // Se generará en beforeAll
      roles: [mockRoles.estudiante],
      toObject: function() { return { ...this, password: undefined }; },
    },
  };

  const mockCourse = {
    _id: '507f1f77bcf86cd799439031',
    name: 'Curso de Prueba',
    description: 'Descripción del curso',
    teacher: '507f1f77bcf86cd799439022',
    students: [],
    active: true,
  };

  beforeAll(async () => {
    // Generar contraseñas hasheadas
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockUsers.admin.password = hashedPassword;
    mockUsers.docente.password = hashedPassword;
    mockUsers.estudiante.password = hashedPassword;

    // Helper to create a chainable mock (supports .populate().populate().select().exec())
    const chainable = (result: any) => {
      const chain: any = {
        exec: jest.fn().mockResolvedValue(result),
        populate: jest.fn(),
        select: jest.fn(),
      };
      // allow multiple populate/select calls
      chain.populate.mockImplementation(() => chain);
      chain.select.mockImplementation(() => chain);
      return chain;
    };

    // Mock del UserModel - act as constructor and provide chainable query defaults
    mockUserModel = jest.fn();
    mockUserModel.findOne = jest.fn().mockImplementation(() => chainable(null));
    mockUserModel.findById = jest.fn().mockImplementation(() => chainable(null));
    mockUserModel.create = jest.fn().mockResolvedValue(null);
    mockUserModel.findByIdAndUpdate = jest.fn().mockImplementation(() => chainable(null));
    mockUserModel.find = jest.fn().mockImplementation(() => chainable([]));
    // when used as `new UserModel(dto)` return an object with save() and toObject()
    mockUserModel.mockImplementation((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        ...data,
        toObject: function() {
          const { password, ...rest } = this;
          return rest;
        },
      }),
      toObject: function() {
        const { password, ...rest } = this;
        return rest;
      },
    }));

    // Mock del RoleModel - siempre retornar chainable
    mockRoleModel = {
      findOne: jest.fn().mockImplementation(() => chainable(null)),
      findById: jest.fn().mockImplementation(() => chainable(mockRoles.estudiante)),
      create: jest.fn(),
      find: jest.fn().mockImplementation(() => chainable([])),
    };

    // Mock del CourseModel as a constructor function and provide chainable defaults
    mockCourseModel = jest.fn();
    mockCourseModel.findById = jest.fn().mockImplementation(() => chainable(null));
    mockCourseModel.create = jest.fn().mockResolvedValue(null);
    mockCourseModel.findByIdAndUpdate = jest.fn().mockImplementation(() => chainable(null));
    mockCourseModel.find = jest.fn().mockImplementation(() => chainable([]));
    // default constructor behavior
    mockCourseModel.mockImplementation((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ 
        _id: '507f1f77bcf86cd799439099', 
        ...data,
        toObject: function() { return this; },
      }),
      toObject: function() { return this; },
    }));

    // Mock del PermissionModel
    mockPermissionModel = {
      find: jest.fn().mockImplementation(() => chainable([])),
      create: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(mockUserModel)
      .overrideProvider(getModelToken(Role.name))
      .useValue(mockRoleModel)
      .overrideProvider(getModelToken(Course.name))
      .useValue(mockCourseModel)
      .overrideProvider(getModelToken(Permission.name))
      .useValue(mockPermissionModel)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generar tokens de autenticación
    adminToken = jwtService.sign({
      sub: mockUsers.admin._id,
      email: mockUsers.admin.email,
      name: mockUsers.admin.name,
      roles: ['ADMIN'],
      permissions: [],
    });

    docenteToken = jwtService.sign({
      sub: mockUsers.docente._id,
      email: mockUsers.docente.email,
      name: mockUsers.docente.name,
      roles: ['DOCENTE'],
      permissions: [{ name: 'create:course', method: 'POST' }],
    });

    estudianteToken = jwtService.sign({
      sub: mockUsers.estudiante._id,
      email: mockUsers.estudiante.email,
      name: mockUsers.estudiante.name,
      roles: ['ESTUDIANTE'],
      permissions: [],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 🔐 AUTHENTICATION TESTS
  // ==========================================

  describe('Authentication', () => {
    describe('POST /auth/login - Login exitoso', () => {
      it('debe retornar mensaje de verificación cuando las credenciales son correctas', async () => {
        // Configurar mocks
        mockUserModel.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              ...mockUsers.estudiante,
              toObject: () => ({ ...mockUsers.estudiante, password: undefined }),
            }),
          }),
        });

        mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUsers.estudiante);

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'estudiante@test.com',
            password: 'password123',
          })
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('email', 'estudiante@test.com');
        expect(response.body).toHaveProperty('requiresVerification', true);
        expect(mockUserModel.findOne).toHaveBeenCalledWith({
          email: 'estudiante@test.com',
        });
      });
    });

    describe('POST /auth/login - Login fallido', () => {
      it('debe retornar 401 cuando la contraseña es incorrecta', async () => {
        // Mock: usuario existe pero contraseña incorrecta
        mockUserModel.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              ...mockUsers.estudiante,
              password: await bcrypt.hash('otrapassword', 10),
              toObject: () => ({ ...mockUsers.estudiante }),
            }),
          }),
        });

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'estudiante@test.com',
            password: 'password-incorrecta',
          })
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
      });

      it('debe retornar 401 cuando el usuario no existe', async () => {
        mockUserModel.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'noexiste@test.com',
            password: 'password123',
          })
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
      });
    });
  });

  // ==========================================
  // 👥 USER MANAGEMENT TESTS
  // ==========================================

  describe('User Management', () => {
    describe('POST /users - Crear usuario', () => {
      it('debe fallar al crear usuario sin token (401)', async () => {
        // Configurar mocks para que findOne retorne null (email no existe)
        mockUserModel.findOne.mockImplementationOnce(() => chainable(null));
        
        const response = await request(app.getHttpServer())
          .post('/users')
          .send({
            name: 'Nuevo Usuario',
            email: 'nuevo@test.com',
            password: 'password123',
            roleId: mockRoles.estudiante._id,
          })
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Unauthorized');
      });

      it('debe fallar al crear usuario con rol Docente (403)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers.docente),
          }),
        });

        const response = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${docenteToken}`)
          .send({
            name: 'Nuevo Usuario',
            email: 'nuevo@test.com',
            password: 'password123',
            roleId: mockRoles.estudiante._id,
          })
          .expect(403);

        expect(response.body).toHaveProperty('message');
      });

      it('debe crear usuario exitosamente con rol Admin (201)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers.admin),
          }),
        });

        // Mock para verificar que el email no existe
        mockUserModel.findOne.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        });

        // Mock para verificar que el rol existe
        mockRoleModel.findById.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockRoles.estudiante),
        });

        // Mock del usuario guardado
        const mockSavedUser = {
          _id: '507f1f77bcf86cd799439041',
          name: 'Nuevo Usuario',
          email: 'nuevo@test.com',
          roles: [mockRoles.estudiante._id],
          toObject: jest.fn().mockReturnValue({
            _id: '507f1f77bcf86cd799439041',
            name: 'Nuevo Usuario',
            email: 'nuevo@test.com',
            roles: [mockRoles.estudiante],
          }),
        };

        // Mock del constructor UserModel - retorna objeto con save()
        mockUserModel.mockImplementationOnce((data: any) => ({
          ...data,
          save: jest.fn().mockResolvedValue(mockSavedUser),
        }));

        const response = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Nuevo Usuario',
            email: 'nuevo@test.com',
            password: 'password123',
            roleId: mockRoles.estudiante._id,
          })
          .expect(201);

        expect(response.body).toHaveProperty('name', 'Nuevo Usuario');
        expect(response.body).toHaveProperty('email', 'nuevo@test.com');
        expect(mockUserModel).toHaveBeenCalled(); // Verificar que el constructor fue llamado
      });
    });

    describe('GET /users - Obtener usuarios', () => {
      it('debe obtener todos los usuarios exitosamente (Admin)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers.admin),
          }),
        });

        mockUserModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([
                mockUsers.admin,
                mockUsers.docente,
                mockUsers.estudiante,
              ]),
            }),
          }),
        });

        const response = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(3);
      });
    });
  });

  // ==========================================
  // 📚 COURSE MANAGEMENT TESTS
  // ==========================================

  describe('Course Management', () => {
    describe('POST /courses - Crear curso', () => {
      it('debe fallar al crear curso con rol Estudiante (403)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers.estudiante),
          }),
        });

        const response = await request(app.getHttpServer())
          .post('/courses')
          .set('Authorization', `Bearer ${estudianteToken}`)
          .send({
            name: 'Nuevo Curso',
            description: 'Descripción',
            teacherId: mockUsers.docente._id,
          })
          .expect(403);

        expect(response.body).toHaveProperty('message');
        expect(mockCourseModel.create).not.toHaveBeenCalled();
      });

      it('debe crear curso exitosamente con rol Docente (201)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              ...mockUsers.docente,
              roles: [mockRoles.docente],
            }),
          }),
        });

        const newCourse = {
          _id: '507f1f77bcf86cd799439051',
          name: 'Nuevo Curso',
          description: 'Descripción',
          teacher: mockUsers.docente._id,
          students: [],
          active: true,
          save: jest.fn().mockResolvedValue({
            _id: '507f1f77bcf86cd799439051',
            name: 'Nuevo Curso',
            description: 'Descripción',
            teacher: mockUsers.docente._id,
            students: [],
            active: true,
          }),
        };

        // Mock del constructor del modelo
        mockCourseModel.mockImplementation(() => newCourse);

        // Mock para el findById después del save
        mockCourseModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue({
            _id: '507f1f77bcf86cd799439051',
            name: 'Nuevo Curso',
            description: 'Descripción',
            teacher: mockUsers.docente,
            students: [],
            active: true,
          }),
        });

        const response = await request(app.getHttpServer())
          .post('/courses')
          .set('Authorization', `Bearer ${docenteToken}`)
          .send({
            name: 'Nuevo Curso',
            description: 'Descripción',
            teacherId: mockUsers.docente._id,
          })
          .expect(201);

        expect(response.body).toHaveProperty('name', 'Nuevo Curso');
        expect(response.body).toHaveProperty('teacher');
      });
    });

    describe('POST /courses/:id/enroll - Inscribir estudiantes', () => {
      it('debe inscribir estudiantes exitosamente (Docente)', async () => {
        // Mock de userModel.findById - retorna usuario según el ID
        mockUserModel.findById.mockImplementation((userId: string) => ({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(
              userId === mockUsers.docente._id
                ? mockUsers.docente
                : {
                    ...mockUsers.estudiante,
                    roles: [mockRoles.estudiante],
                  },
            ),
          }),
        }));

        // Mock del curso - findById retorna curso con save()
        const mockCourseWithSave = {
          _id: mockCourse._id,
          name: mockCourse.name,
          description: mockCourse.description,
          teacher: mockUsers.docente._id,
          students: [] as any[],
          active: true,
          save: jest.fn().mockResolvedValue({
            _id: mockCourse._id,
            name: mockCourse.name,
            students: [mockUsers.estudiante._id],
          }),
        };

        // Mock de courseModel.findById - necesita ser más inteligente
        let findByIdCallCount = 0;
        mockCourseModel.findById.mockImplementation(() => {
          findByIdCallCount++;
          if (findByIdCallCount === 1) {
            // Primera llamada - retorna curso simple con exec()
            return {
              exec: jest.fn().mockResolvedValue(mockCourseWithSave),
            };
          } else {
            // Segunda llamada después de save - retorna con populate chainable
            return {
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue({
                    ...mockCourse,
                    students: [
                      {
                        _id: mockUsers.estudiante._id,
                        name: mockUsers.estudiante.name,
                        email: mockUsers.estudiante.email,
                      },
                    ],
                    teacher: {
                      _id: mockUsers.docente._id,
                      name: mockUsers.docente.name,
                      email: mockUsers.docente.email,
                    },
                  }),
                }),
              }),
            };
          }
        });

        const response = await request(app.getHttpServer())
          .post(`/courses/${mockCourse._id}/enroll`)
          .set('Authorization', `Bearer ${docenteToken}`)
          .send({
            studentIds: [mockUsers.estudiante._id],
          });

        // El endpoint POST retorna 201 Created
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('students');
        expect(mockCourseWithSave.save).toHaveBeenCalled();
      });
    });

    describe('GET /courses - Ver cursos', () => {
      it('debe ver cursos exitosamente como Estudiante (200)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers.estudiante),
          }),
        });

        mockCourseModel.find.mockReturnValue(chainable([
          {
            ...mockCourse,
            students: [mockUsers.estudiante._id],
          },
        ]));

        const response = await request(app.getHttpServer())
          .get('/courses')
          .set('Authorization', `Bearer ${estudianteToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('debe ver cursos exitosamente como Docente (200)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers.docente),
          }),
        });

        mockCourseModel.find.mockReturnValue(chainable([mockCourse]));

        const response = await request(app.getHttpServer())
          .get('/courses')
          .set('Authorization', `Bearer ${docenteToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('debe ver todos los cursos exitosamente como Admin (200)', async () => {
        mockUserModel.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUsers.admin),
          }),
        });

        mockCourseModel.find.mockReturnValue(chainable([
          mockCourse,
          { ...mockCourse, _id: '507f1f77bcf86cd799439032' },
          { ...mockCourse, _id: '507f1f77bcf86cd799439033' },
        ]));

        const response = await request(app.getHttpServer())
          .get('/courses')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
