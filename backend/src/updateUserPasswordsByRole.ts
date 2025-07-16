import { MikroORM } from '@mikro-orm/core';
import { User } from './entities/user.entity.ts';
import config from './mikro-orm.config.ts';
import bcrypt from 'bcryptjs';

async function updateUserPasswordsByRole() {
  const orm = await MikroORM.init(config);
  const em = orm.em;
  
  try {
    console.log('=== Mise à jour des mots de passe par rôle ===');
    
    // Définir les nouveaux mots de passe
    const adminPassword = 'admin123';
    const userPassword = 'users123';
    
    // Hash des mots de passe
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);
    
    // Récupérer tous les utilisateurs
    const allUsers = await em.find(User, {});
    
    console.log(`\nUtilisateurs trouvés: ${allUsers.length}`);
    
    for (const user of allUsers) {
      let newPassword;
      let passwordType;
      
      // Déterminer le mot de passe selon le rôle
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'club_admin') {
        newPassword = hashedAdminPassword;
        passwordType = 'admin123';
      } else {
        newPassword = hashedUserPassword;
        passwordType = 'users123';
      }
      
      // Mettre à jour le mot de passe
      user.password = newPassword;
      await em.persistAndFlush(user);
      
      console.log(`✅ ${user.email} (${user.role}) → ${passwordType}`);
    }
    
    console.log('\n🎉 Récapitulatif des mots de passe :');
    console.log('📋 ADMINS (admin, super_admin, club_admin) → admin123');
    console.log('📋 USERS (user) → users123');
    
    console.log('\n🔑 Comptes disponibles :');
    console.log('- admin@kempo.com / admin123');
    console.log('- admin.nancy@kempo.com / admin123');
    console.log('- admin.lyon@kempo.com / admin123');
    console.log('- test@nancy.com / admin123');
    console.log('- test@lyon.com / admin123');
    console.log('- t.verbelen@gmail.com / users123');
    console.log('- tsuyo.th@gmail.com / users123');
    console.log('- pierre.dupont@gmail.com / users123');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await orm.close();
  }
}

updateUserPasswordsByRole().catch(console.error);
