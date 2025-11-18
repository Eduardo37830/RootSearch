import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('RootSearch API')
    .setDescription(
      'API para el sistema educativo RootSearch - Gestión de usuarios, cursos y documentos',
    )
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticación y autorización')
    .addTag('users', 'Gestión de usuarios (Docentes y Estudiantes)')
    .addTag('courses', 'Gestión de cursos y matrícula de estudiantes')
    .addTag('materials', 'Generación de material de estudio con IA')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Aplicación corriendo en: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Documentación Swagger: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
