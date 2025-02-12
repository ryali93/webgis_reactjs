FROM python:3.10-slim

WORKDIR /usr/src/app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y curl ffmpeg libsm6 libxext6 git git-lfs

# Copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Definir variable de entorno para el token (se pasa en build)
ARG HF_TOKEN
ENV HF_TOKEN="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"

RUN mkdir -p /usr/src/app/src/weights

RUN git clone https://huggingface.co/ryali93/vhr_tidop /usr/src/app/src/weights && \
    cd /usr/src/app/src/weights && git lfs pull
    
# Copiar el código fuente
COPY . /usr/src/app

# Agregar `src/` al PYTHONPATH
ENV PYTHONPATH=/usr/src/app

# Exponer el puerto de la aplicación
EXPOSE 8000

# Ejecutar Gunicorn directamente
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "src.server:app"]
