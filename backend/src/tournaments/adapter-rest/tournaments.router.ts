import type { Context } from "hono";
import { getApp } from "../../api/get-app.ts";
import { Category } from "../../entities/Category.entity.ts";
import { Match } from "../../entities/match.entity.ts";
import { TournamentCompetitorCategory } from "../../entities/tournament-competitor-category.entity.ts";
import { Tournament } from "../../entities/Tournament.entity.ts";
import { User } from "../../entities/user.entity.ts";
import { TournamentRegistration, RegistrationStatus } from "../../entities/tournament-registration.entity.ts";
import { TournamentsRoutes } from "./tournaments.openapi.ts";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function buildTournamentsRouter() {
    const router = getApp();

    return router
        // GET /tournaments/{id} - Obtenir un tournoi par ID
        .openapi(TournamentsRoutes.get, async (ctx) => {
            const { id } = ctx.req.valid('param');
            const em = ctx.get("em");
            const result = await em.findOne(Tournament, { id });
            
            if (result == null) {
                return ctx.text("Not found", 404);
            }

            return ctx.json({
                id: result.id,
                name: result.name,
                description: result.description,
                city: result.city,
                club: result.club,
                createdBy: result.createdBy,
                start_date: result.start_date.toISOString(),
                end_date: result.end_date?.toISOString(),
                registration_deadline: result.registration_deadline?.toISOString(),
                minAge: result.minAge,
                maxAge: result.maxAge,
                minWeight: result.minWeight,
                maxWeight: result.maxWeight,
                allowedGrades: result.allowedGrades,
                gender: result.gender as 'M' | 'F' | 'MIXED' | undefined,
                maxParticipants: result.maxParticipants,
                system: result.system,
                status: result.status,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString()
            }, 200);
        })
        
        // POST /tournaments - Créer un tournoi basique
        .openapi(TournamentsRoutes.post, async (ctx) => {
            const body = ctx.req.valid("json");
            const em = ctx.get("em");
            
            // Vérifier l'authentification
            const token = ctx.req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return ctx.text('Token d\'authentification requis', 401);
            }
            
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
                const user = await em.findOne(User, { id: decoded.id });
                
                if (!user) {
                    return ctx.text('Utilisateur non trouvé', 404);
                }
                
                // Seuls les admins et club_admins peuvent créer des tournois
                if (user.role !== 'admin' && user.role !== 'club_admin') {
                    return ctx.text('Permissions insuffisantes', 403);
                }
                
                const result = em.create(Tournament, {
                    name: body.name,
                    city: body.city,
                    start_date: body.start_date,
                    end_date: body.end_date,
                    club: user.club || 'Club non spécifié', // Utiliser le club de l'utilisateur connecté
                    createdBy: user.id,
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                await em.persistAndFlush(result);
                return ctx.text(`Tournament created: ${result.name}`, 201);
                
            } catch (error: any) {
                console.error('Erreur lors de la création du tournoi:', error);
                if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                    return ctx.text('Token d\'authentification invalide', 401);
                }
                return ctx.text('Erreur lors de la création du tournoi', 500);
            }
        })
        
        // PUT /tournaments/{id} - Mettre à jour un tournoi
        .openapi(TournamentsRoutes.put, async (ctx) => {
            const { id } = ctx.req.valid('param');
            const body = ctx.req.valid('json');
            const em = ctx.get("em");
            
            const result = await em.findOne(Tournament, { id });
            if (result == null) {
                return ctx.text("Not found", 404);
            }

            result.name = body.name ?? result.name;
            result.city = body.city ?? result.city;
            result.start_date = body.start_date ?? result.start_date;
            result.end_date = body.end_date ?? result.end_date;

            await em.flush();
            return ctx.text("Tournament updated", 201);
        })
        
        // GET /tournaments - Lister les tournois du club de l'utilisateur
        .openapi(TournamentsRoutes.list, async (ctx) => {
            const query = ctx.req.valid('query');
            const em = ctx.get("em");
            
            // Vérifier l'authentification pour filtrer par club
            const token = ctx.req.header('Authorization')?.replace('Bearer ', '');
            let userClub: string | null = null;
            
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
                    const user = await em.findOne(User, { id: decoded.id });
                    if (user && user.club) {
                        userClub = user.club;
                    }
                } catch (error: any) {
                    console.error('Erreur token:', error);
                    // Continue sans filtrage si le token est invalide
                }
            }
            
            // Filtrer par club si l'utilisateur est connecté
            const filterConditions = userClub ? { club: userClub, ...query } : query;
            const result = await em.find(Tournament, filterConditions);
            
            const mappedResult = result.map(tournament => ({
                id: tournament.id,
                name: tournament.name,
                description: tournament.description,
                city: tournament.city,
                club: tournament.club,
                createdBy: tournament.createdBy,
                start_date: tournament.start_date.toISOString(),
                end_date: tournament.end_date?.toISOString(),
                registration_deadline: tournament.registration_deadline?.toISOString(),
                minAge: tournament.minAge,
                maxAge: tournament.maxAge,
                minWeight: tournament.minWeight,
                maxWeight: tournament.maxWeight,
                allowedGrades: tournament.allowedGrades,
                gender: tournament.gender as 'M' | 'F' | 'MIXED' | undefined,
                maxParticipants: tournament.maxParticipants,
                system: tournament.system,
                status: tournament.status,
                createdAt: tournament.createdAt.toISOString(),
                updatedAt: tournament.updatedAt.toISOString()
            }));
            
            return ctx.json(mappedResult, 200);
        })
        
        // POST /tournaments/{id}/register - S'inscrire à un tournoi
        .openapi(TournamentsRoutes.registerToTournamentRoute, async (ctx) => {
            const { id } = ctx.req.valid('param');
            const em = ctx.get("em");
            
            // Vérifier l'authentification
            const token = ctx.req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return ctx.json({ message: 'Token d\'authentification requis' }, 401);
            }
            
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
                const user = await em.findOne(User, { id: decoded.id });
                
                if (!user) {
                    return ctx.json({ message: 'Utilisateur non trouvé' }, 404);
                }
                
                // Trouver le tournoi
                const tournament = await em.findOne(Tournament, { id });
                if (!tournament) {
                    return ctx.json({ message: 'Tournoi non trouvé' }, 404);
                }
                
                // Vérifier l'éligibilité
                const eligibility = await checkUserEligibility(user, tournament);
                if (!eligibility.eligible) {
                    return ctx.json({ 
                        message: 'Inscription refusée', 
                        reasons: eligibility.reasons 
                    }, 400);
                }
                
                // Vérifier si l'utilisateur n'est pas déjà inscrit
                const existingRegistration = await em.findOne(TournamentRegistration, {
                    user: user,
                    tournament: tournament
                });
                
                if (existingRegistration) {
                    return ctx.json({ 
                        message: 'Vous êtes déjà inscrit à ce tournoi',
                        reasons: [`Statut actuel: ${existingRegistration.status}`]
                    }, 400);
                }
                
                // Créer l'inscription
                const registration = em.create(TournamentRegistration, {
                    user: user,
                    tournament: tournament,
                    status: RegistrationStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                await em.persistAndFlush(registration);
                
                return ctx.json({ 
                    message: 'Inscription réussie ! Votre inscription est en attente de validation.'
                }, 200);
                
            } catch (error: any) {
                console.error('Erreur lors de l\'inscription:', error);
                if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                    return ctx.json({ message: 'Token d\'authentification invalide' }, 401);
                }
                return ctx.json({ message: 'Erreur lors de l\'inscription' }, 500);
            }
        });
}

// Fonction utilitaire pour vérifier l'éligibilité d'un utilisateur
async function checkUserEligibility(user: User, tournament: Tournament): Promise<{ eligible: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let eligible = true;

    // Vérifier le club
    if (user.club && tournament.club && user.club !== tournament.club) {
        eligible = false;
        reasons.push('Vous devez être membre du club organisateur');
    }

    // Vérifier l'approbation
    if (!user.approved) {
        eligible = false;
        reasons.push('Votre compte doit être approuvé par l\'administrateur du club');
    }

    // Vérifier l'âge si défini
    if (tournament.minAge !== undefined || tournament.maxAge !== undefined) {
        if (user.birthDate) {
            const age = new Date().getFullYear() - user.birthDate.getFullYear();
            if (tournament.minAge !== undefined && age < tournament.minAge) {
                eligible = false;
                reasons.push(`Âge minimum requis: ${tournament.minAge} ans`);
            }
            if (tournament.maxAge !== undefined && age > tournament.maxAge) {
                eligible = false;
                reasons.push(`Âge maximum autorisé: ${tournament.maxAge} ans`);
            }
        } else {
            eligible = false;
            reasons.push('Date de naissance requise pour vérifier l\'âge');
        }
    }

    // Vérifier les grades autorisés
    if (tournament.allowedGrades && tournament.allowedGrades.length > 0) {
        if (!user.grade || !tournament.allowedGrades.includes(user.grade)) {
            eligible = false;
            reasons.push(`Grades autorisés: ${tournament.allowedGrades.join(', ')}`);
        }
    }

    // Vérifier la date limite d'inscription
    if (tournament.registration_deadline && new Date() > tournament.registration_deadline) {
        eligible = false;
        reasons.push('La date limite d\'inscription est dépassée');
    }

    // Vérifier le statut du tournoi
    if (tournament.status !== 'OPEN') {
        eligible = false;
        reasons.push('Le tournoi n\'est plus ouvert aux inscriptions');
    }

    return { eligible, reasons };
}

