# Configuración del Servidor de Transcripción Local

## Problema
```
❌ Error HTTP: 400 - Bad Request
📋 Response data: {
  detail: '[WinError 2] El sistema no puede encontrar el archivo especificado'
}
```

## Causa
El backend de NestJS intenta usar un servidor Python local en `http://127.0.0.1:8000` para transcribir audio, pero:

1. **El servidor Python no está ejecutándose**, O
2. **El servidor Python no tiene acceso a la carpeta `backend/uploads/`**, O
3. **Deberías usar el adaptador de OpenAI en lugar del servidor local**

## Solución 1: Usar OpenAI (Recomendado) ✅

Es más fácil y no requiere servidor Python adicional.

### Configurar el Backend para usar OpenAI

1. **Edita el archivo `.env` del backend:**

```env
# Transcription Adapter: 'openai' o 'local'
TRANSCRIPTION_ADAPTER=openai

# OpenAI API Key
OPENAI_API_KEY=tu_api_key_aqui
```

2. **Reinicia el backend:**

```powershell
cd C:\universidad\Ingenieria_software_3\RootSearch\backend
npm run start:dev
```

El backend ahora usará la API de OpenAI Whisper para transcribir.

## Solución 2: Configurar Servidor Python Local

Si prefieres usar transcripción local (gratis pero requiere configuración):

### Paso 1: Crear el servidor Python

Crea un archivo `transcription-server/main.py`:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import whisper
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Permitir CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelo de Whisper (una sola vez al iniciar)
print("Cargando modelo Whisper...")
model = whisper.load_model("base")  # Puedes usar: tiny, base, small, medium, large
print("✅ Modelo cargado")

class TranscriptionRequest(BaseModel):
    file_path: str
    language: str = "es"

@app.post("/api/transcribe")
async def transcribe_audio(request: TranscriptionRequest):
    try:
        file_path = request.file_path
        
        # Verificar que el archivo existe
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=400,
                detail=f"Archivo no encontrado: {file_path}"
            )
        
        print(f"📂 Transcribiendo: {file_path}")
        
        # Transcribir
        result = model.transcribe(
            file_path,
            language=request.language,
            fp16=False  # Usar CPU
        )
        
        print(f"✅ Transcripción completada")
        
        return {
            "text": result["text"],
            "language": result["language"]
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"status": "ok", "message": "Servidor de transcripción activo"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

### Paso 2: Instalar dependencias Python

```powershell
# Crear entorno virtual
cd C:\universidad\Ingenieria_software_3\RootSearch
mkdir transcription-server
cd transcription-server

python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install fastapi uvicorn openai-whisper torch
```

### Paso 3: Iniciar el servidor Python

```powershell
cd C:\universidad\Ingenieria_software_3\RootSearch\transcription-server
.\venv\Scripts\Activate.ps1
python main.py
```

Deberías ver:
```
Cargando modelo Whisper...
✅ Modelo cargado
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Paso 4: Configurar el backend

En el archivo `.env` del backend:

```env
TRANSCRIPTION_ADAPTER=local
LOCAL_TRANSCRIPTION_ENDPOINT=http://127.0.0.1:8000/api/transcribe
```

## Solución 3: Verificar Permisos de Carpeta

Si el servidor Python está corriendo pero no encuentra los archivos:

1. **Verifica que la carpeta uploads existe:**

```powershell
ls C:\universidad\Ingenieria_software_3\RootSearch\backend\uploads
```

2. **Dale permisos completos a la carpeta:**

```powershell
icacls "C:\universidad\Ingenieria_software_3\RootSearch\backend\uploads" /grant Everyone:F
```

## Comparación de Opciones

| Característica | OpenAI (Recomendado) | Servidor Local |
|----------------|----------------------|----------------|
| Configuración | ✅ Fácil (solo API Key) | ⚠️ Requiere Python + Whisper |
| Costo | 💰 $0.006/minuto | 🆓 Gratis |
| Velocidad | ⚡ Muy rápido | 🐌 Lento (depende de tu CPU/GPU) |
| Calidad | 🌟 Excelente | 👍 Buena (modelo base) |
| Requisitos | Internet | CPU/GPU potente |
| Idiomas | 50+ idiomas | 50+ idiomas |

## Verificación

### Probar OpenAI:
```powershell
curl -X POST http://localhost:3001/materials/upload-audio `
  -H "Authorization: Bearer tu_token" `
  -F "file=@audio.ogg" `
  -F "courseId=123"
```

### Probar servidor local:
```powershell
# Verificar que está activo
curl http://127.0.0.1:8000/
```

## Recomendación Final

**Usa OpenAI** (Solución 1) porque:
- Es más rápido
- No requiere configuración adicional
- La calidad es excelente
- El costo es muy bajo ($0.006 por minuto)

Solo usa el servidor local si:
- No tienes presupuesto para APIs
- Necesitas procesar muchas horas de audio
- Tienes una GPU potente
