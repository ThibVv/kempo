import { Collection, EntitySchema } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AgeGroup } from './age-group.entity.ts';
import { Competitor } from './Competitor.entity.ts';
import { Category } from './Category.entity.ts';

export enum EnumRank {
  WHITE = 'Ceinture Blanche',
  WHITE_YELLOW = 'Ceinture Blanche-Jaune',
  YELLOW = 'Ceinture Jaune',
  YELLOW_ORANGE = 'Ceinture Jaune-Orange',
  ORANGE = 'Ceinture Orange',
  ORANGE_GREEN = 'Ceinture Orange-Verte',
  GREEN = 'Ceinture Verte',
  GREEN_BLUE = 'Ceinture Verte-Bleue',
  BLUE = 'Ceinture Bleue',
  BLUE_BROWN = 'Ceinture Bleue-Marron',
  BROWN = 'Ceinture Marron',
  BLACK_1 = 'Ceinture Noire 1ère dan',
  BLACK_2 = 'Ceinture Noire 2ème dan',
  BLACK_3 = 'Ceinture Noire 3ème dan',
  BLACK_4 = 'Ceinture Noire 4ème dan',
  BLACK_5 = 'Ceinture Noire 5ème dan',
  BLACK_6 = 'Ceinture Noire 6ème dan',
}


export class Tournament {
  id!: string;
  name!: string;
  description?: string;
  city?: string;
  club!: string; // Club organisateur
  createdBy!: number; // ID de l'admin qui a créé le tournoi
  start_date!: Date;
  end_date?: Date;
  registration_deadline?: Date;
  
  // Filtres d'éligibilité
  minAge?: number;
  maxAge?: number;
  minWeight?: number;
  maxWeight?: number;
  allowedGrades?: string[]; // Grades autorisés
  gender?: string; // 'M', 'F', ou 'MIXED'
  
  // Configuration
  maxParticipants?: number;
  system?: string;
  status: string = 'OPEN'; // 'OPEN', 'CLOSED', 'STARTED', 'FINISHED'
  
  competitors = new Collection<Competitor>(this);
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

export const TournamentSchema = new EntitySchema({
  class: Tournament,
  properties: {
    id: { type: 'uuid', onCreate: () => v4(), primary: true },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    club: { type: 'string' },
    createdBy: { type: 'number', fieldName: 'created_by' },
    start_date: { type: 'Date' },
    end_date: { type: 'Date', nullable: true },
    registration_deadline: { type: 'Date', nullable: true },
    
    // Filtres
    minAge: { type: 'number', nullable: true },
    maxAge: { type: 'number', nullable: true },
    minWeight: { type: 'number', nullable: true },
    maxWeight: { type: 'number', nullable: true },
    allowedGrades: { type: 'json', nullable: true },
    gender: { type: 'string', nullable: true },
    
    // Configuration
    maxParticipants: { type: 'number', nullable: true },
    system: { type: 'string', nullable: true },
    status: { type: 'string', default: 'OPEN' },
    
    competitors: { kind: 'm:n', entity: () => Competitor, pivotTable: 'tournament_competitor_category' },
    createdAt: { type: 'Date', defaultRaw: 'now()', fieldName: 'createdAt' },
    updatedAt: { type: 'Date', defaultRaw: 'now()', onUpdate: () => new Date(), fieldName: 'updatedAt' }
  },
});


