# RootSearch

## Descripción

RootSearch es un proyecto desarrollado para la asignatura de Ingeniería de Software III. Este proyecto es un monorepo que incluye un backend desarrollado con NestJS, un frontend desarrollado con Next.js (TypeScript, Tailwind CSS), documentación y configuración de infraestructura.

## Estructura del Proyecto

- `backend/`: Código del servidor backend desarrollado con NestJS.
- `frontend/`: Código de la interfaz de usuario frontend desarrollado con Next.js (TypeScript, Tailwind CSS).
- `docs/`: Documentación del proyecto.
- `ci/`: Configuraciones de integración continua.
- `infra/`: Configuraciones de infraestructura, incluyendo Docker.

## Monorepo

Este proyecto utiliza npm workspaces para gestionar el monorepo. Los workspaces son `backend` y `frontend`.

### Scripts disponibles en la raíz:

- `npm run dev`: Ejecuta el modo desarrollo en todos los workspaces.
- `npm run build`: Construye todos los workspaces.
- `npm run start`: Inicia la producción en todos los workspaces.
- `npm run lint`: Ejecuta linting en todos los workspaces.
- `npm run test`: Ejecuta tests en todos los workspaces.
- `npm run format`: Formatea el código en todos los workspaces.

### Configuraciones compartidas:

- ESLint y Prettier configurados en la raíz para consistencia.
- .gitignore compartido.
- Docker Compose para desarrollo en `infra/docker/docker-compose.dev.yml`.

## CI/CD

El proyecto incluye configuraciones de integración continua en la carpeta `ci/`. Los workflows de GitHub Actions ejecutan linting, tests y builds automáticamente en pushes y pull requests.

## Infraestructura

- Dockerfiles para backend y frontend en `infra/docker/`.
- Docker Compose para desarrollo con base de datos PostgreSQL.

## Instalación

1. Clona este repositorio:
   ```
   git clone https://github.com/Eduardo37830/RootSearch.git
   ```

2. Navega al directorio del proyecto:
   ```
   cd RootSearch
   ```

3. Instala todas las dependencias (incluyendo workspaces):
   ```
   npm install
   ```

4. Configura las variables de entorno:
   - Copia `.env.example` a `.env` en la raíz y ajusta las variables compartidas.
   - Copia `backend/.env.example` a `backend/.env` y configura las variables del backend.
   - Copia `frontend/.env.example` a `frontend/.env` y configura las variables del frontend.

## Uso

Para ejecutar todo el proyecto en modo desarrollo:
```
npm run dev
```

O individualmente:

1. Para ejecutar el backend (NestJS):
   ```
   cd backend
   npm run start:dev
   ```

2. Para ejecutar el frontend (Next.js):
   ```
   cd frontend
   npm run dev
   ```

Para desarrollo con Docker:
```
cd infra/docker
docker-compose -f docker-compose.dev.yml up --build
```

## Servicio de transcripción de audio a texto

Además del backend y frontend, debes tener ejecutándose el servicio de transcripción de audio a texto basado en Whisper:

- Repositorio: https://github.com/Eduardo37830/whisperServer
- Instalación:
  ```
  git clone https://github.com/Eduardo37830/whisperServer.git
  cd whisperServer
  pip install -r requirements.txt
  python app.py
  ```
- Puedes configurar el modelo de Whisper que prefieras editando el archivo `services.py` dentro de ese repositorio.

## Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y commitea: `git commit -m 'Agrega nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
