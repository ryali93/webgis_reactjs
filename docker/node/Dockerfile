FROM node:20.5.1

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar 7zip
RUN apt-get update && apt-get install -y p7zip-full
RUN apt-get install -y postgresql-client

# Instalar todas las dependencias del proyecto localmente en node_modules dentro del contenedor
RUN npm install
RUN npm i @craco/craco
RUN npm install date-fns chartjs-adapter-date-fns --save

# Copiar todo el código fuente
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 4000

# npm run build
# npx serve -s build
# Comando por defecto al iniciar el contenedor
# CMD ["npx", "serve", "-s", "build"]
CMD ["npm", "start"]
