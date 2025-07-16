import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity.ts';

export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Créer le super administrateur
    const existingSuperAdmin = await em.findOne(User, { email: 'admin@kempo.com' });
    if (!existingSuperAdmin) {
      const superAdmin = em.create(User, {
        email: 'admin@kempo.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        club: 'Administration Générale',
        city: 'France',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await em.persistAndFlush(superAdmin);
      console.log('Compte super administrateur créé avec succès');
      console.log('Email: admin@kempo.com');
      console.log('Mot de passe: admin123');
    } else {
      // Mettre à jour le rôle si nécessaire
      if (existingSuperAdmin.role !== 'super_admin') {
        existingSuperAdmin.role = 'super_admin';
        await em.flush();
        console.log('Rôle du super admin mis à jour');
      } else {
        console.log('Le compte super administrateur existe déjà');
      }
    }

    // Créer l'administrateur du club de Nancy
    const existingNancyAdmin = await em.findOne(User, { email: 'admin.nancy@kempo.com' });
    if (!existingNancyAdmin) {
      const nancyAdmin = em.create(User, {
        email: 'admin.nancy@kempo.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Nancy',
        role: 'club_admin',
        club: 'Kempo Club Nancy',
        city: 'Nancy',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await em.persistAndFlush(nancyAdmin);
      console.log('Compte administrateur Nancy créé avec succès');
      console.log('Email: admin.nancy@kempo.com');
      console.log('Mot de passe: admin123');
    } else {
      console.log('Le compte administrateur Nancy existe déjà');
    }

    // Créer l'administrateur du club de Lyon
    const existingLyonAdmin = await em.findOne(User, { email: 'admin.lyon@kempo.com' });
    if (!existingLyonAdmin) {
      const lyonAdmin = em.create(User, {
        email: 'admin.lyon@kempo.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Lyon',
        role: 'club_admin',
        club: 'Kempo Club Lyon',
        city: 'Lyon',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await em.persistAndFlush(lyonAdmin);
      console.log('Compte administrateur Lyon créé avec succès');
      console.log('Email: admin.lyon@kempo.com');
      console.log('Mot de passe: admin123');
    } else {
      console.log('Le compte administrateur Lyon existe déjà');
    }

    // Mettre à jour l'ancien compte admin@kenpo.com s'il existe
    const oldAdmin = await em.findOne(User, { email: 'admin@kenpo.com' });
    if (oldAdmin) {
      console.log('Ancien compte admin@kenpo.com trouvé - mise à jour du rôle');
      oldAdmin.role = 'club_admin';
      await em.flush();
    }
  }
}
