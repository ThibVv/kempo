import { MikroORM } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import mikroOrmConfig from './mikro-orm.config.ts';

async function applyMigration() {
  const orm = await MikroORM.init(mikroOrmConfig);
  
  try {
    // Exécuter la migration SQL directement
    await orm.em.getConnection().execute('ALTER TABLE `tournament` ADD COLUMN `created_by` INT NOT NULL DEFAULT 1;');
    console.log('Migration appliquée avec succès: colonne created_by ajoutée à la table tournament');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Duplicate column name')) {
      console.log('La colonne created_by existe déjà dans la table tournament');
    } else {
      console.error('Erreur lors de l\'application de la migration:', error);
    }
  } finally {
    await orm.close();
  }
}

applyMigration().catch(console.error);
