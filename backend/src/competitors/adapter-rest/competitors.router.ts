import type { Query } from "@mikro-orm/migrations";
import { getApp } from "../../api/get-app.ts";
import { Category } from "../../entities/Category.entity.ts";
import { Competitor } from "../../entities/Competitor.entity.ts";
import { CompetitorsRoutes } from "./competitors.openapi.ts";
import type { FilterQuery } from "@mikro-orm/core";

export function buildCompetitorsRouter() {
    const router = getApp()

    return router.openapi(CompetitorsRoutes.get, async (ctx) => {

        const { id } = ctx.req.valid('param')
        const em = ctx.get("em");
        const result = await em.findOne(Competitor, { id })
        if (result == null) {
            return ctx.text("Not found", 404);
        }

        return ctx.json({
            id: result.id,
            firstname: result.firstname,
            lastname: result.lastname,
            birthday: result.birthday,
            club: result.club,
            country: result.country,
            weight: result.weight,
            rank: result.rank,
            gender: result.gender

        }, 200)

    })
        .openapi(CompetitorsRoutes.post, async (ctx) => {
            const body = ctx.req.valid("json")

            const em = ctx.get("em");
            const result = em.create(Competitor, body)

            const oui = await em.persistAndFlush(result);


            return ctx.text("Competitor created", 201);
        })
        .openapi(CompetitorsRoutes.put, async (ctx) => {
            const { id } = ctx.req.valid('param')
            const body = ctx.req.valid('json');

            const em = ctx.get("em");
            const result = await em.findOne(Competitor, { id })
            if (result == null) {
                return ctx.text("Not found", 404);
            }

            result.firstname = body.firstname ?? result.firstname
            result.lastname = body.lastname ?? result.lastname
            result.birthday = body.birthday ?? result.birthday
            result.club = body.club ?? result.club
            result.country = body.country ?? result.country
            result.weight = body.weight ?? result.weight
            result.rank = body.rank ?? result.rank
            result.gender = body.gender ?? result.gender



            await em.flush();

            return ctx.text("Tournament updated", 201);
        })
        .openapi(CompetitorsRoutes.delete, async (ctx) => {
            const { id } = ctx.req.valid('param')
            const em = ctx.get("em")
            const result = await em.findOne(Competitor, { id })


            if (result == null) {
                return ctx.text("Not found", 404);
            }
            em.nativeDelete(Competitor, { id })

            return ctx.text("Competitor Deleted", 202)
        })
        .openapi(CompetitorsRoutes.getByCategory, async (ctx) => {
            const { id } = ctx.req.valid('param')
            const em = ctx.get("em")
            const category = await em.findOne(Category, { id }, { populate: ['weight_category', 'age_group'] })

            if (category == null) {
                return ctx.text("Category not found", 404);
            }

            let query: FilterQuery<Competitor> = {
                rank: { $in: category.rank }
            }

            if (category.gender) {
                query = {
                    ...query,
                    gender: category.gender
                }

            }
            if (category.weight_category) {
                query = {
                    ...query,
                    weight: { $gte: category.weight_category.weight_min, $lte: category.weight_category.weight_max }
                }
            }

            if (category.age_group) {
                let dateAgeMin = new Date()
                let dateAgeMax = new Date()
                dateAgeMin.setFullYear(dateAgeMin.getFullYear() - category.age_group.age_min)
                dateAgeMax.setFullYear(dateAgeMax.getFullYear() - category.age_group.age_max)
                query = {
                    ...query,
                    birthday: { $lte: dateAgeMin, $gte: dateAgeMax }
                }
            }



            const competitors = await em.find(Competitor, query)

            return ctx.json(competitors, 200)
        })
        .openapi(CompetitorsRoutes.getAll, async (ctx) => {
            const em = ctx.get("em")
            const competitors = await em.find(Competitor, {}, { populate: ['rank'] })
            return ctx.json(competitors, 200)
        })
        .openapi(CompetitorsRoutes.importCsv, async (ctx) => {
            const em = ctx.get("em");
            const body = await ctx.req.parseBody();
            const file = body.file as File;
            
            if (!file || !file.name.endsWith('.csv')) {
                return ctx.json({
                    message: 'Fichier CSV valide requis',
                    errors: ['Le fichier doit avoir l\'extension .csv']
                }, 400);
            }
            
            try {
                const fileContent = await file.text();
                const lines = fileContent.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    return ctx.json({
                        message: 'Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données',
                        errors: ['Fichier CSV vide ou insuffisant']
                    }, 400);
                }
                
                // Supprimer la ligne d'en-tête
                const dataLines = lines.slice(1);
                const errors: string[] = [];
                let imported = 0;
                
                for (let i = 0; i < dataLines.length; i++) {
                    const line = dataLines[i].trim();
                    if (!line) continue;
                    
                    try {
                        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
                        
                        if (columns.length < 8) {
                            errors.push(`Ligne ${i + 2}: Nombre de colonnes insuffisant (attendu: 8, reçu: ${columns.length})`);
                            continue;
                        }
                        
                        const [lastname, firstname, club, country, rank, birthDateStr, gender, weightStr] = columns;
                        
                        // Validation et conversion des données
                        if (!lastname || !firstname || !country || !rank || !birthDateStr || !gender) {
                            errors.push(`Ligne ${i + 2}: Champs obligatoires manquants`);
                            continue;
                        }
                        
                        const birthDate = new Date(birthDateStr);
                        if (isNaN(birthDate.getTime())) {
                            errors.push(`Ligne ${i + 2}: Date de naissance invalide (${birthDateStr})`);
                            continue;
                        }
                        
                        const weight = weightStr ? parseFloat(weightStr) : undefined;
                        if (weightStr && isNaN(weight!)) {
                            errors.push(`Ligne ${i + 2}: Poids invalide (${weightStr})`);
                            continue;
                        }
                        
                        // Créer le compétiteur
                        const competitor = em.create(Competitor, {
                            firstname,
                            lastname,
                            birthday: birthDate,
                            club: club || undefined,
                            country,
                            weight,
                            rank: rank as any, // On fait confiance à la validation Zod
                            gender: gender as any
                        });
                        
                        console.log(`Compétiteur créé: ${firstname} ${lastname}, Grade: ${rank}, Sexe: ${gender}`);
                        imported++;
                    } catch (error) {
                        errors.push(`Ligne ${i + 2}: Erreur lors du traitement (${error instanceof Error ? error.message : 'Erreur inconnue'})`);
                    }
                }
                
                // Sauvegarder tous les compétiteurs en une fois
                if (imported > 0) {
                    await em.flush();
                }
                
                return ctx.json({
                    message: `Import terminé: ${imported} compétiteur(s) importé(s)`,
                    imported,
                    errors: errors.length > 0 ? errors : undefined
                }, 200);
                
            } catch (error) {
                console.error('Erreur lors de l\'import CSV:', error);
                return ctx.json({
                    message: 'Erreur lors du traitement du fichier CSV',
                    errors: [error instanceof Error ? error.message : 'Erreur inconnue']
                }, 400);
            }
        })
}