import { Collection, EntitySchema } from "@mikro-orm/core";
import { EnumRank } from "./Tournament.entity.ts";
// Import supprimé pour éviter la dépendance circulaire
// Utilisera un import dynamique dans le schéma

export class User {
  id!: number;
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  role!: string;
  birthDate?: Date;
  club?: string;
  city?: string;
  grade?: string; // Grade de l'utilisateur (ceinture blanche, jaune, etc.)
  approved?: boolean; // Approbation par l'admin du club
  resetPasswordToken?: string; // Mappée à reset_password_token
  resetPasswordExpires?: Date; // Mappée à reset_password_expires
  // Ne pas initialiser la collection ici pour éviter la dépendance circulaire
  // tournamentRegistrations?: Collection<any>;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

export const UserSchema = new EntitySchema({
  class: User,
  properties: {    
    id: { type: 'number', primary: true, autoincrement: true },
    email: { type: 'string', unique: true },
    password: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    role: { type: 'string', default: 'user' },
    birthDate: { type: 'Date', nullable: true },
    club: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    grade: { type: 'string', nullable: true },
    approved: { type: 'boolean', default: false, nullable: true },
    resetPasswordToken: { type: 'string', nullable: true, fieldName: 'reset_password_token' },
    resetPasswordExpires: { type: 'Date', nullable: true, fieldName: 'reset_password_expires' },
    // Relation temporairement désactivée - sera réactivée quand TournamentRegistration sera configuré
    // tournamentRegistrations: { 
    //   kind: '1:m', 
    //   entity: () => 'TournamentRegistration', 
    //   mappedBy: 'user',
    //   nullable: true 
    // },
    createdAt: { type: 'Date', defaultRaw: 'now()' },
    updatedAt: { type: 'Date', defaultRaw: 'now()', onUpdate: () => new Date() }
  }
});