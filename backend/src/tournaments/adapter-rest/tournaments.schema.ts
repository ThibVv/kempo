import { z } from "@hono/zod-openapi";
import { EnumRank } from "../../entities/Tournament.entity.ts";
import { AgeGroup } from "../../entities/age-group.entity.ts";
import { EnumGender } from "../../entities/weight-category.ts";
import { EnumEliminationType } from "../../entities/Category.entity.ts";


export const TournamentSchema = z.object({
    id: z.optional(z.string().uuid()),
    name: z.optional(z.string()),
    description: z.optional(z.string()),
    city: z.optional(z.string()),
    club: z.optional(z.string()),
    createdBy: z.optional(z.number()),
    start_date: z.optional(z.coerce.date()),
    end_date: z.optional(z.coerce.date()),
    registration_deadline: z.optional(z.coerce.date()),
    
    // Filtres d'éligibilité
    minAge: z.optional(z.number()),
    maxAge: z.optional(z.number()),
    minWeight: z.optional(z.number()),
    maxWeight: z.optional(z.number()),
    allowedGrades: z.optional(z.array(z.string())),
    gender: z.optional(z.enum(['M', 'F', 'MIXED'])),
    
    // Configuration
    maxParticipants: z.optional(z.number()),
    system: z.optional(z.string()),
    status: z.optional(z.string()),
    
    createdAt: z.optional(z.coerce.date()),
    updatedAt: z.optional(z.coerce.date())
})

// Schéma pour créer un tournoi
export const CreateTournamentSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    city: z.string().optional(),
    start_date: z.coerce.date(),
    end_date: z.coerce.date().optional(),
    registration_deadline: z.coerce.date().optional(),
    
    // Filtres d'éligibilité
    minAge: z.number().optional(),
    maxAge: z.number().optional(),
    minWeight: z.number().optional(),
    maxWeight: z.number().optional(),
    allowedGrades: z.array(z.string()).optional(),
    gender: z.enum(['M', 'F', 'MIXED']).optional(),
    
    // Configuration
    maxParticipants: z.number().optional(),
    system: z.string().optional()
})

export type Tournament = z.infer<typeof TournamentSchema>

export const CategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    rank: z.array(z.nativeEnum(EnumRank)),
    gender: z.optional(z.nativeEnum(EnumGender)),
    weight_category: z.optional(z.number()),
    elimination_type: z.nativeEnum(EnumEliminationType),
    age_group: z.optional(z.number())
})


export const CategorySchemaCreate = CategorySchema.omit({id : true})

export const CategorySchemaUpdate = CategorySchema.omit({id : true}).partial()

export type Category = z.infer<typeof CategorySchema>


