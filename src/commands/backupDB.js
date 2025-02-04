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
const SQL_FILE = `${BACKUP_PATH}/${process.env.DB_DATABASE}.sql`;
const BACKUP_FILE = `${BACKUP_PATH}/${process.env.DB_DATABASE}.7z`;

(async function backupDatabase() {
  console.log('Iniciando respaldo de la base de datos...');

  // 1. Eliminar backups anteriores
  console.log('Eliminando respaldos anteriores...');
  const removeOldBackupCommand = `rm -f ${BACKUP_FILE}.*`;
  runCommand(removeOldBackupCommand);

  // 2. Generar un respaldo en formato SQL
  console.log('Creando respaldo de la base de datos...');
  const dumpCommand = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump --host=${process.env.DB_HOST} --port=5432 --username=postgres --format=p --blobs --encoding=UTF8 --verbose --file=${SQL_FILE} ${process.env.DB_DATABASE}`;
  runCommand(dumpCommand);

  // 3. Comprimir el archivo SQL generado
  console.log('Comprimiendo respaldo...');
  const compressCommand = `7z a -r -bsp2 -v10m ${BACKUP_FILE} ${SQL_FILE}`;
  runCommand(compressCommand);

  // 4. Eliminar el archivo SQL temporal
  console.log('Limpiando archivo SQL temporal...');
  const removeSqlCommand = `rm -f ${SQL_FILE}`;
  runCommand(removeSqlCommand);

  console.log('Respaldo completado exitosamente.');
})();
