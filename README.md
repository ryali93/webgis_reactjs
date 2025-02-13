# WebGis Roadeye (ReactJS)

## Levantar aplicación
1. Clonar repositorio, incluyendo submódulos
- `git clone --recurse-submodules git@github.com:ryali93/webgis_reactjs.git`

2. Modificar archivo `.env` de acuerdo a proyecto, en específico `APP_HOST`
- `APP_HOST=http://0.0.0.0`

3. Levantar aplicación completa
- `docker-compose up --build -d`

4. Restauración de la base de datos (sólo la primera vez)
- `docker exec -it reactjs node src/commands/restoreDB.js`

### Desarrollo
5. Instalar los módulos de la aplicación
- `npm install`

6. Inicializar aplicación
- `npm start`



<!-- Backup de la base de datos
- `node src/commands/backupDB.js` -->
