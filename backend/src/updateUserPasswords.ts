import { MikroORM } from '@mikro-orm/core';
import { User } from './entities/user.entity.ts';
import config from './mikro-orm.config.ts';
import bcrypt from 'bcryptjs';

async function updateUserPasswords() {
  const orm = await MikroORM.init(config);
  const em = orm.em;
  
  try {
    console.log('=== Mise à jour des mots de passe ===');
    
    const usersToUpdate = [
      'admin@kempo.com',
      'admin.nancy@kempo.com',
      'admin.lyon@kempo.com',
      't.verbelen@gmail.com',
      'tsuyo.th@gmail.com',
      'pierre.dupont@gmail.com'
    ];
    
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    for (const email of usersToUpdate) {
      const user = await em.findOne(User, { email });
      if (user) {
        user.password = hashedPassword;
        await em.persistAndFlush(user);
        console.log(`✅ Mot de passe mis à jour pour ${email}`);
      } else {
        console.log(`❌ Utilisateur non trouvé: ${email}`);
      }
    }
    
    console.log('\n🎉 Tous les mots de passe ont été mis à jour vers: password123');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await orm.close();
  }
}

updateUserPasswords().catch(console.error);
