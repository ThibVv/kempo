// mikro-orm.config.ts
import { MikroORM } from '@mikro-orm/core';
import { defineConfig, MySqlDriver } from '@mikro-orm/mysql';
import { Tournament } from './entities/Tournament.entity.ts';
import { Category } from './entities/Category.entity.ts';
import { Competitor } from './entities/Competitor.entity.ts';
import { Match } from './entities/match.entity.ts';
import { TournamentCompetitorCategory } from './entities/tournament-competitor-category.entity.ts';
import { AgeGroup } from './entities/age-group.entity.ts';
import { WeightCategory } from './entities/weight-category.ts';
import { TournamentRegistration } from './entities/tournament-registration.entity.ts';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { UserSchema } from './entities/user.entity.ts';

// Configuration de la base de données
const dbConfig = process.env.DATABASE_URL ? {
  // Configuration avec DATABASE_URL (pour Render)
  clientUrl: process.env.DATABASE_URL,
} : {
  // Configuration avec variables individuelles (pour développement local)
  dbName: process.env.DB_NAME || 'kempo_db',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export default defineConfig({
  ...dbConfig,
  entities: [
    Tournament, 
    Category, 
    Competitor, 
    Match, 
    TournamentCompetitorCategory,
    AgeGroup,
    WeightCategory,
    UserSchema,
    TournamentRegistration
  ],
  discovery: {
    warnWhenNoEntities: false, // Désactive l'avertissement quand aucune entité n'est trouvée via discovery
    requireEntitiesArray: true, // Force l'utilisation du tableau d'entités explicite
  },
  driver: MySqlDriver,
  allowGlobalContext: true,
  extensions: [Migrator, SeedManager],
})