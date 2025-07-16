import { MikroORM } from '@mikro-orm/core';
import { User } from '../entities/user.entity.ts';
import config from '../mikro-orm.config.ts';
import bcrypt from 'bcryptjs';

async function checkAndCreateUsers() {
  const orm = await MikroORM.init(config);
  const em = orm.em;
  
  try {
    console.log('=== Vérification des utilisateurs existants ===');
    
    // Lister tous les utilisateurs
    const users = await em.find(User, {});
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\nUtilisateurs existants:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Rôle: ${user.role}, Club: ${user.club}, Approuvé: ${user.approved}`);
      });
    }
    
    // Créer un utilisateur test s'il n'existe pas
    const testEmail = 'test@nancy.com';
    const existingUser = await em.findOne(User, { email: testEmail });
    
    if (!existingUser) {
      console.log('\n=== Création d\'un utilisateur test ===');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUser = em.create(User, {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Nancy',
        role: 'club_admin',
        club: 'Nancy Kempo',
        approved: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await em.persistAndFlush(testUser);
      
      console.log('✅ Utilisateur test créé avec succès!');
      console.log('Email: test@nancy.com');
      console.log('Mot de passe: password123');
      console.log('Rôle: club_admin');
      console.log('Club: Nancy Kempo');
    } else {
      console.log('\n✅ Utilisateur test existe déjà');
      console.log('Email: test@nancy.com');
      console.log('Mot de passe: password123');
    }
    
    // Créer un utilisateur Lyon pour tester le filtrage
    const lyonEmail = 'test@lyon.com';
    const existingLyonUser = await em.findOne(User, { email: lyonEmail });
    
    if (!existingLyonUser) {
      console.log('\n=== Création d\'un utilisateur Lyon ===');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const lyonUser = em.create(User, {
        email: lyonEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Lyon',
        role: 'club_admin',
        club: 'Lyon Kempo',
        approved: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await em.persistAndFlush(lyonUser);
      
      console.log('✅ Utilisateur Lyon créé avec succès!');
      console.log('Email: test@lyon.com');
      console.log('Mot de passe: password123');
      console.log('Rôle: club_admin');
      console.log('Club: Lyon Kempo');
    } else {
      console.log('\n✅ Utilisateur Lyon existe déjà');
      console.log('Email: test@lyon.com');
      console.log('Mot de passe: password123');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await orm.close();
  }
}

checkAndCreateUsers().catch(console.error);
