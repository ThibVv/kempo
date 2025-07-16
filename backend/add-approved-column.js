import mysql from 'mysql2/promise';

async function addApprovedColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'kempo_db'
    });
    
    console.log('📡 Connexion à la base de données...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'kempo_db' 
      AND TABLE_NAME = 'user' 
      AND COLUMN_NAME = 'approved'
    `);
    
    if (columns.length > 0) {
      console.log('✅ La colonne approved existe déjà');
      return;
    }
    
    // Ajouter la colonne
    await connection.execute(`
      ALTER TABLE user 
      ADD COLUMN approved BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ Colonne approved ajoutée avec succès!');
    
    // Mettre à jour tous les utilisateurs existants pour qu'ils soient approuvés par défaut
    const [result] = await connection.execute(`
      UPDATE user 
      SET approved = TRUE 
      WHERE role IN ('admin', 'super_admin', 'club_admin')
    `);
    
    console.log(`✅ ${result.affectedRows} administrateurs mis à jour (approuvés automatiquement)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Connexion fermée');
    }
  }
}

addApprovedColumn();
