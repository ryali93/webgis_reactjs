FROM node:20.5.1

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar el código fuente del servidor
COPY .env .
COPY server/ .

# Instalar dependencias
RUN npm install

# Exponer el puerto del servidor
EXPOSE 4001

# Comando por defecto
CMD ["npm", "start"]