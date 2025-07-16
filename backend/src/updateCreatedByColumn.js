import mysql from 'mysql2/promise';

async function updateCreatedByColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'kempo_db'
  });

  try {
    // Mettre à jour la colonne createdBy pour avoir une valeur par défaut
    await connection.execute('ALTER TABLE tournament MODIFY COLUMN createdBy INT DEFAULT 1');
    console.log('Colonne createdBy mise à jour avec une valeur par défaut');
    
    // Vérifier la structure
    const [structure] = await connection.execute('DESCRIBE tournament');
    console.log('Structure mise à jour:');
    console.table(structure);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

updateCreatedByColumn();
