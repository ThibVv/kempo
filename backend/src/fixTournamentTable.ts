import mysql from 'mysql2/promise';

async function checkTournamentTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kempo_db'
  });

  try {
    // Vérifier la structure de la table tournament
    const [rows] = await connection.execute('DESCRIBE tournament');
    console.log('Structure de la table tournament:');
    console.log(rows);
    
    // Vérifier si la colonne created_by existe
    const columns = rows as any[];
    const hasCreatedBy = columns.some(col => col.Field === 'created_by');
    
    if (!hasCreatedBy) {
      console.log('La colonne created_by n\'existe pas. Ajout...');
      await connection.execute('ALTER TABLE tournament ADD COLUMN created_by INT NOT NULL DEFAULT 1');
      console.log('Colonne created_by ajoutée avec succès !');
    } else {
      console.log('La colonne created_by existe déjà.');
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkTournamentTable().catch(console.error);
