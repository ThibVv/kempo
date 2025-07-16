import { MikroORM } from '@mikro-orm/core';
import { AdminSeeder } from './seeders/AdminSeeder.ts';
import config from './mikro-orm.config.ts';

async function createAdmins() {
  try {
    console.log('Connexion à la base de données...');
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();
    
    console.log('Exécution du seeder AdminSeeder...');
    const seeder = new AdminSeeder();
    await seeder.run(em);
    
    console.log('\n=== COMPTES CRÉÉS ===');
    console.log('Super Admin:');
    console.log('  Email: admin@kempo.com');
    console.log('  Mot de passe: admin123');
    console.log('  Rôle: super_admin');
    console.log('');
    console.log('Admin Nancy:');
    console.log('  Email: admin.nancy@kempo.com');
    console.log('  Mot de passe: admin123');
    console.log('  Rôle: club_admin');
    console.log('  Club: Kempo Club Nancy');
    console.log('');
    console.log('Admin Lyon:');
    console.log('  Email: admin.lyon@kempo.com');
    console.log('  Mot de passe: admin123');
    console.log('  Rôle: club_admin');
    console.log('  Club: Kempo Club Lyon');
    
    await orm.close();
    console.log('\nTerminé avec succès !');
  } catch (error) {
    console.error('Erreur lors de la création des admins:', error);
    process.exit(1);
  }
}

createAdmins();
