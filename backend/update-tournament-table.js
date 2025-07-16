import mysql from 'mysql2/promise';

async function updateTournamentTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'kempo_db'
    });
    
    console.log('📡 Connexion à la base de données...');
    
    // Liste des colonnes à ajouter
    const columnsToAdd = [
      'ADD COLUMN description TEXT',
      'ADD COLUMN club VARCHAR(255) NOT NULL',
      'ADD COLUMN createdBy INT NOT NULL',
      'ADD COLUMN registration_deadline DATETIME',
      'ADD COLUMN minAge INT',
      'ADD COLUMN maxAge INT',
      'ADD COLUMN minWeight DECIMAL(5,2)',
      'ADD COLUMN maxWeight DECIMAL(5,2)',
      'ADD COLUMN allowedGrades JSON',
      'ADD COLUMN maxParticipants INT',
      'ADD COLUMN status VARCHAR(50) DEFAULT "OPEN"',
      'ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP',
      'ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    ];
    
    for (const columnDefinition of columnsToAdd) {
      try {
        await connection.execute(`ALTER TABLE tournament ${columnDefinition}`);
        console.log(`✅ Colonne ajoutée: ${columnDefinition}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Colonne existe déjà: ${columnDefinition}`);
        } else {
          console.error(`❌ Erreur pour ${columnDefinition}:`, error.message);
        }
      }
    }
    
    console.log('✅ Mise à jour de la table tournament terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Connexion fermée');
    }
  }
}

updateTournamentTable();
