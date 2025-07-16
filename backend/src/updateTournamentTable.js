import mysql from 'mysql2/promise';

async function addCreatedByColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'kempo_db'
  });

  try {
    // Vérifier si la colonne existe
    const [rows] = await connection.execute('SHOW COLUMNS FROM tournament LIKE "created_by"');
    
    if (rows.length === 0) {
      console.log('Ajout de la colonne created_by...');
      await connection.execute('ALTER TABLE tournament ADD COLUMN created_by INT NULL DEFAULT 1');
      console.log('Colonne created_by ajoutée avec succès !');
    } else {
      console.log('La colonne created_by existe déjà');
    }
    
    // Vérifier la structure finale
    const [structure] = await connection.execute('DESCRIBE tournament');
    console.log('Structure de la table tournament:');
    console.table(structure);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

addCreatedByColumn();
