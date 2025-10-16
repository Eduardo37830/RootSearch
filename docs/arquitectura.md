# Arquitectura del Proyecto RootSearch

## Arquitectura General

El proyecto sigue una arquitectura de monorepo con separación clara entre backend y frontend, utilizando microservicios ligeros.

## Backend (NestJS)

- **Framework**: NestJS con TypeScript
- **Patrón**: MVC con módulos, controladores y servicios
- **Base de datos**: PostgreSQL con ORM (posible integración con Prisma)
- **Autenticación**: JWT (planeado)
- **API**: RESTful con documentación Swagger

## Frontend (Next.js)

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS

## Infraestructura

- **Contenerización**: Docker con Docker Compose para desarrollo
- **CI/CD**: GitHub Actions para linting, tests y builds
- **Despliegue**: Vercel

## Comunicación

- Frontend consume APIs REST del backend
- Variables de entorno para configuración
- CORS configurado para desarrollo local

## Escalabilidad

- Monorepo permite desarrollo coordinado
- Workspaces npm para gestión de dependencias
- Configuraciones compartidas (ESLint, Prettier)