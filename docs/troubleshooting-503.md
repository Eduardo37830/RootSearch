# Solución de Error 503 en Materials

## Problema
Cuando intentas subir un audio en la sección de Materials, aparece el error:
```
Error: Error uploading audio
Failed to load resource: the server responded with a status of 503 (Service Unavailable)
```

## Causas Comunes

### 1. Backend no está ejecutándose ⚠️
**Solución más común**: El servidor backend debe estar activo en `http://localhost:3001`

**Cómo verificar y solucionar:**

```powershell
# Navega a la carpeta del backend
cd C:\universidad\Ingenieria_software_3\RootSearch\backend

# Instala dependencias si no lo has hecho
npm install

# Inicia el servidor backend
npm run start:dev
```

El backend debería mostrar algo como:
```
[Nest] Application successfully started
[Nest] Mapped {/materials/upload-audio, POST} route
```

### 2. Variables de entorno no configuradas
Verifica que el archivo `.env` en la carpeta `backend` contenga:

```env
# MongoDB
MONGO_URI=tu_conexion_mongodb

# OpenAI (para transcripción y generación)
OPENAI_API_KEY=tu_api_key_de_openai

# JWT
JWT_SECRET=tu_secreto_jwt

# Email (opcional para notificaciones)
EMAIL_USER=tu_email
EMAIL_PASSWORD=tu_password
```

### 3. Puerto incorrecto
Verifica en `backend/src/main.ts` que el puerto sea **3001**:

```typescript
await app.listen(3001);
```

Y en `frontend/services/materials.js` que la URL apunte correctamente:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

### 4. MongoDB no está conectado
Si el backend inicia pero MongoDB no está conectado:

- **Usando MongoDB local**: Asegúrate de que MongoDB esté ejecutándose
- **Usando MongoDB Atlas**: Verifica tu conexión a internet y las credenciales

### 5. Timeout por archivos grandes
Si el audio es muy grande (>100MB) o muy largo (>30 minutos):

- El proceso de transcripción puede tardar mucho
- OpenAI puede tener límites de tamaño
- Considera dividir el audio en partes más pequeñas

## Verificación Paso a Paso

### 1. Verificar que el backend está corriendo
```powershell
# En una terminal
cd C:\universidad\Ingenieria_software_3\RootSearch\backend
npm run start:dev
```

### 2. Verificar que el frontend está corriendo
```powershell
# En otra terminal
cd C:\universidad\Ingenieria_software_3\RootSearch\frontend
npm run dev
```

### 3. Probar la conexión
Abre tu navegador y ve a `http://localhost:3001/` - deberías ver una respuesta del backend.

### 4. Ver logs del backend
Cuando subas un audio, revisa la terminal del backend para ver:
- Si llega la petición
- Si hay errores de OpenAI
- Si hay problemas con MongoDB

## Mensajes de Error Mejorados

Ahora el frontend mostrará mensajes más descriptivos:

- ✅ **"El servidor no está disponible"** → El backend no está corriendo
- ✅ **"No autorizado. El token expiró"** → Cierra sesión e inicia sesión nuevamente
- ✅ **"No se puede conectar con el servidor"** → Verifica la URL del backend
- ✅ **"Error interno del servidor"** → Revisa los logs del backend

## Solución Rápida

```powershell
# Terminal 1 - Backend
cd C:\universidad\Ingenieria_software_3\RootSearch\backend
npm run start:dev

# Terminal 2 - Frontend
cd C:\universidad\Ingenieria_software_3\RootSearch\frontend
npm run dev

# Abre el navegador en http://localhost:3000
```

## Notas Adicionales

- El proceso de subir audio y generar contenido puede tardar **varios minutos** dependiendo del tamaño del archivo
- Asegúrate de tener una API Key válida de OpenAI
- Los archivos de audio se guardan temporalmente en `backend/uploads/` y se eliminan después de procesar
- El material generado queda en estado "PENDIENTE_REVISION" hasta que lo publiques

## Contacto

Si el problema persiste después de seguir estos pasos, revisa:
1. Los logs del backend en la terminal
2. La consola del navegador (F12 > Console)
3. Las variables de entorno del backend
