require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

// Función para ejecutar comandos y manejar errores
function runCommand(command) {
  try {
    console.log(`Ejecutando: ${command}`);
    const output = execSync(command, { stdio: 'inherit' }); // Muestra la salida en tiempo real
    console.log(output);
  } catch (error) {
    console.error(`Error ejecutando el comando: ${command}`);
    console.error(error.message);
    process.exit(1); // Detener la ejecución si ocurre un error
  }
}

// Ruta base para los archivos de respaldo
const BACKUP_PATH = 'docker/postgresql/backups';
const BACKUP_FILE = `${BACKUP_PATH}/${process.env.DB_DATABASE}.7z.001`;
const SQL_FILE = `${BACKUP_PATH}/${process.env.DB_DATABASE}.sql`;

(async function restoreDatabase() {
  console.log('Iniciando restauración de la base de datos...');

  // 1. Extraer el archivo comprimido
  console.log('Extrayendo respaldo...');
  const extractCommand = `7z e -bsp2 ${BACKUP_FILE} -o${BACKUP_PATH}`;
  runCommand(extractCommand);

  // 2. Eliminar la base de datos existente
  console.log('Eliminando base de datos existente...');
  const dropCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -p 5432 -d postgres -U postgres -c "DROP DATABASE ${process.env.DB_DATABASE} WITH (FORCE)"`;
  runCommand(dropCommand);

//   // 3. Crear una nueva base de datos
  console.log('Creando nueva base de datos...');
  const createCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -p 5432 -d postgres -U postgres -c "CREATE DATABASE ${process.env.DB_DATABASE}"`;
  runCommand(createCommand);

//   // 4. Restaurar la base de datos desde el archivo SQL
  console.log('Restaurando base de datos...');
  const restoreCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -p 5432 -d ${process.env.DB_DATABASE} -U postgres -a -f ${SQL_FILE}`;
  runCommand(restoreCommand);

//   // 5. Eliminar el archivo SQL extraído
  console.log('Limpiando archivos temporales...');
  const deleteCommand = `rm ${SQL_FILE}`;
  runCommand(deleteCommand);

  console.log('Restauración completada exitosamente.');
})();
