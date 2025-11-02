import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Role, RoleDocument } from '../auth/schemas/role.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import * as bcrypt from 'bcrypt';

async function seedUsersAndCourses() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const roleModel = app.get<Model<RoleDocument>>(getModelToken(Role.name));
  const courseModel = app.get<Model<CourseDocument>>(
    getModelToken(Course.name),
  );

  try {
    console.log('🌱 Iniciando seed de usuarios y cursos...\n');

    // 1. Buscar roles
    const docenteRole = await roleModel.findOne({ name: 'docente' }).exec();
    const estudianteRole = await roleModel
      .findOne({ name: 'estudiante' })
      .exec();

    if (!docenteRole || !estudianteRole) {
      console.error(
        '❌ Error: Los roles DOCENTE y ESTUDIANTE deben existir primero.',
      );
      console.log('💡 Ejecuta primero el seed de roles del AuthModule.');
      await app.close();
      return;
    }

    console.log('✅ Roles encontrados');

    // 2. Crear Docentes
    const teachers = [
      {
        name: 'Dr. Carlos Méndez',
        email: 'carlos.mendez@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [docenteRole._id],
      },
      {
        name: 'Dra. Ana Torres',
        email: 'ana.torres@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [docenteRole._id],
      },
      {
        name: 'Ing. Roberto Silva',
        email: 'roberto.silva@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [docenteRole._id],
      },
    ];

    const createdTeachers: UserDocument[] = [];
    for (const teacher of teachers) {
      const existing = await userModel.findOne({ email: teacher.email }).exec();
      if (!existing) {
        const newTeacher = await userModel.create(teacher);
        createdTeachers.push(newTeacher);
        console.log(`✅ Docente creado: ${teacher.name}`);
      } else {
        createdTeachers.push(existing);
        console.log(`ℹ️  Docente ya existe: ${teacher.name}`);
      }
    }

    // 3. Crear Estudiantes
    const students = [
      {
        name: 'María García',
        email: 'maria.garcia@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [estudianteRole._id],
      },
      {
        name: 'Juan Pérez',
        email: 'juan.perez@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [estudianteRole._id],
      },
      {
        name: 'Laura Martínez',
        email: 'laura.martinez@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [estudianteRole._id],
      },
      {
        name: 'Pedro Rodríguez',
        email: 'pedro.rodriguez@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [estudianteRole._id],
      },
      {
        name: 'Sofía López',
        email: 'sofia.lopez@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [estudianteRole._id],
      },
      {
        name: 'Diego Hernández',
        email: 'diego.hernandez@universidad.edu',
        password: await bcrypt.hash('password123', 10),
        roles: [estudianteRole._id],
      },
    ];

    const createdStudents: UserDocument[] = [];
    for (const student of students) {
      const existing = await userModel.findOne({ email: student.email }).exec();
      if (!existing) {
        const newStudent = await userModel.create(student);
        createdStudents.push(newStudent);
        console.log(`✅ Estudiante creado: ${student.name}`);
      } else {
        createdStudents.push(existing);
        console.log(`ℹ️  Estudiante ya existe: ${student.name}`);
      }
    }

    // 4. Crear Cursos
    const courses = [
      {
        name: 'Ingeniería de Software III',
        description:
          'Curso avanzado de ingeniería de software con enfoque en arquitecturas modernas y metodologías ágiles.',
        teacher: createdTeachers[0]._id,
        students: [
          createdStudents[0]._id,
          createdStudents[1]._id,
          createdStudents[2]._id,
        ],
        active: true,
      },
      {
        name: 'Bases de Datos II',
        description:
          'Estudio profundo de bases de datos relacionales y NoSQL, optimización de consultas y diseño avanzado.',
        teacher: createdTeachers[1]._id,
        students: [
          createdStudents[1]._id,
          createdStudents[3]._id,
          createdStudents[4]._id,
        ],
        active: true,
      },
      {
        name: 'Desarrollo Web Moderno',
        description:
          'Desarrollo de aplicaciones web usando frameworks modernos como React, Next.js y NestJS.',
        teacher: createdTeachers[2]._id,
        students: [
          createdStudents[0]._id,
          createdStudents[2]._id,
          createdStudents[4]._id,
          createdStudents[5]._id,
        ],
        active: true,
      },
      {
        name: 'Algoritmos Avanzados',
        description:
          'Análisis y diseño de algoritmos complejos, estructuras de datos avanzadas y teoría de la complejidad.',
        teacher: createdTeachers[0]._id,
        students: [createdStudents[3]._id, createdStudents[5]._id],
        active: true,
      },
    ];

    for (const course of courses) {
      const existing = await courseModel.findOne({ name: course.name }).exec();
      if (!existing) {
        await courseModel.create(course);
        console.log(`✅ Curso creado: ${course.name}`);
      } else {
        console.log(`ℹ️  Curso ya existe: ${course.name}`);
      }
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Docentes: ${createdTeachers.length}`);
    console.log(`   - Estudiantes: ${createdStudents.length}`);
    console.log(`   - Cursos: ${courses.length}`);
    console.log('\n🔐 Credenciales de prueba:');
    console.log('   Email: carlos.mendez@universidad.edu');
    console.log('   Password: password123');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await app.close();
  }
}

seedUsersAndCourses();
