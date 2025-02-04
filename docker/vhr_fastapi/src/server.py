import os
import sys
import logging
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.sentinel2_function import router as sentinel2_router

# Agregar directorio src al path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# Cargar variables de entorno
load_dotenv()

# Crear la aplicación FastAPI
app = FastAPI(title="VHR FastAPI", version="1.0")

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agregar rutas
app.include_router(sentinel2_router, prefix="/s2")

# Endpoint de configuración
@app.get("/config")
async def get_config():
    return {
        "APP_HOST": os.getenv("APP_HOST", "0.0.0.0"),
        "APP_PORT": os.getenv("APP_PORT", 8000),
    }

@app.middleware("http")
async def log_requests(request, call_next):
    logger = logging.getLogger("uvicorn")
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response
