import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config.ts';
import { Tournament } from './entities/Tournament.entity.ts';

async function testTournamentCreation() {
  const orm = await MikroORM.init(mikroOrmConfig);
  
  try {
    const em = orm.em.fork();
    
    const tournament = em.create(Tournament, {
      name: "Test Tournament",
      city: "Test City",
      start_date: new Date("2025-08-01"),
      end_date: new Date("2025-08-01"),
      club: 'default_club',
      createdBy: 1,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await em.persistAndFlush(tournament);
    console.log('Tournoi créé avec succès !', tournament.id);
    
  } catch (error) {
    console.error('Erreur lors de la création du tournoi:', error);
  } finally {
    await orm.close();
  }
}

testTournamentCreation();
