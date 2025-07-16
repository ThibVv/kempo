import { User, UserSchema } from '../../entities/user.entity.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { 
  changePasswordRoute, 
  createAdminRoute, 
  getMeRoute, 
  loginUserRoute, 
  registerUserRoute, 
  updateProfileRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  getClubAdminsRoute,
  getClubMembersRoute,
  createClubAdminRoute,
  createClubMemberRoute,
  deleteUserRoute,
  approveMemberRoute
} from './users.openapi.ts';
import type { 
  ChangePasswordInput, 
  CreateAdminInput, 
  LoginUserInput, 
  RegisterUserInput, 
  UpdateProfileInput,
  ForgotPasswordInput,
  ResetPasswordInput
} from './users.schema.ts';
import { getApp } from '../../api/get-app.ts';
import type { Context } from 'hono';
import type { AppEnv } from '../../api/get-app.ts';
import { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../../utils/mailjet.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // À configurer dans un environnement de production
const JWT_EXPIRES_IN = '24h';

// Middleware pour vérifier le token JWT
const authMiddleware = async (ctx: Context<AppEnv>, next: () => Promise<void>) => {
  try {
    const authHeader = ctx.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Récupération de l'utilisateur depuis la base de données
    const em = ctx.get('em');
    const user = await em.findOne(User, { id: decoded.id });

    if (!user) {
      return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
    }

    // Stocke l'utilisateur dans le contexte
    (ctx as any).user = user;
    await next();
  } catch (error) {
    return ctx.json({ message: 'Token invalide' }, 401);
  }
};


export function buildUsersRouter() {
  const router = getApp();
  // Route d'enregistrement
  router.openapi(registerUserRoute, async (ctx) => {
    try {
      // Alternative approach to validation
      const body = await ctx.req.json();
      
      if (!body || !body.email || !body.password || !body.firstName || !body.lastName) {
        return ctx.json({ message: 'Tous les champs requis doivent être remplis' }, 400);
      }
        const { email, password, firstName, lastName, birthDate, club, city, grade } = body;
      const em = ctx.get("em");

      // Vérifie si l'email existe déjà
      const existingUser = await em.findOne(User, { email });
      if (existingUser) {
        return ctx.json({ message: 'Cet email est déjà utilisé' }, 409);
      }

      // Cryptage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);    // Création de l'utilisateur
    const user = em.create(User, {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user', // Par défaut, tous les nouveaux utilisateurs ont le rôle 'user'
      approved: false, // Par défaut, les nouveaux utilisateurs ne sont pas approuvés
      birthDate: birthDate ? new Date(birthDate) : undefined,
      club,
      city,
      grade, // Ajout du grade
      createdAt: new Date(),
      updatedAt: new Date(),
    });

      // Sauvegarde en base de données
      await em.persistAndFlush(user);

      // Génération du token JWT
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });      // Retourne le token et les informations utilisateur (sans le mot de passe)
      return ctx.json({
        message: 'Compte créé avec succès ! Bienvenue dans notre communauté.',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      }, 201);
    } catch (error) {
      console.error('Registration error:', error);
      return ctx.json({ message: 'Erreur lors de l\'enregistrement' }, 500);
    }
  });  // Route de connexion
  router.openapi(loginUserRoute, async (ctx) => {
    try {
      // Alternative approach to validation
      const body = await ctx.req.json();
      
      if (!body || !body.email || !body.password) {
        return ctx.json({ message: 'Email et mot de passe requis' }, 400);
      }
      
      const { email, password } = body;
      const em = ctx.get('em');

      // Recherche de l'utilisateur par email
      const user = await em.findOne(User, { email });

      if (!user) {
        return ctx.json({ message: 'Email ou mot de passe incorrect' }, 400);
      }

      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return ctx.json({ message: 'Email ou mot de passe incorrect' }, 400);
      }

      // Génération du token JWT
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });      // Retourne le token et les informations utilisateur (sans le mot de passe)
      return ctx.json({
        message: 'Connexion réussie !',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return ctx.json({ message: 'Erreur lors de la connexion' }, 500);
    }
  });

  // Route pour récupérer le profil de l'utilisateur connecté
  router.openapi(getMeRoute, async (ctx) => {
    // Cette route nécessite une authentification
    try {
      // Nous avons intégré la logique d'authentification directement ici 
      // pour éviter les problèmes de typage avec le middleware
      const authHeader = ctx.req.header('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Récupération de l'utilisateur depuis la base de données
      const em = ctx.get('em');
      const user = await em.findOne(User, { id: decoded.id });

      if (!user) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }      // Retourne les informations utilisateur complètes (sans le mot de passe)
      return ctx.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        approved: user.approved,
        birthDate: user.birthDate,
        club: user.club,
        city: user.city,
        grade: user.grade,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return ctx.json({ message: 'Erreur lors de la récupération du profil' }, 500);
    }
  });

  // Route pour mettre à jour le profil utilisateur
  router.openapi(updateProfileRoute, async (ctx) => {
    try {
      // Récupération du token et vérification
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const user = await em.findOne(User, { id: decoded.id });

      if (!user) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }      const body = await ctx.req.json();
      
      if (!body || !body.email || !body.firstName || !body.lastName) {
        return ctx.json({ message: 'Email, prénom et nom sont requis' }, 400);
      }
        const { email, firstName, lastName, birthDate, club, city, grade, currentPassword, newPassword } = body;
      
      // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
      if (email !== user.email) {
        const existingUser = await em.findOne(User, { email });
        if (existingUser) {
          return ctx.json({ message: 'Cet email est déjà utilisé' }, 409);
        }
      }
      
      // Mise à jour des champs de base
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      if (birthDate) {
        user.birthDate = new Date(birthDate);
      }
      if (club) user.club = club;
      if (city) user.city = city;
      if (grade) user.grade = grade;
      
      // Si changement de mot de passe demandé
      if (currentPassword && newPassword) {        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
          return ctx.json({ message: 'Mot de passe actuel incorrect' }, 400);
        }
        
        // Cryptage du nouveau mot de passe
        user.password = await bcrypt.hash(newPassword, 10);
      }
      
      // Sauvegarde des modifications
      await em.persistAndFlush(user);
        // Retourne les données utilisateur mises à jour (sans le mot de passe)
      return ctx.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        approved: user.approved,
        birthDate: user.birthDate,
        club: user.club,
        city: user.city,
        grade: user.grade,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return ctx.json({ message: 'Erreur lors de la mise à jour du profil' }, 500);
    }
  });

  // Route pour changer le mot de passe
  router.openapi(changePasswordRoute, async (ctx) => {
    try {
      // Récupération du token et vérification
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const user = await em.findOne(User, { id: decoded.id });

      if (!user) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }      const body = await ctx.req.json();
      
      if (!body || !body.currentPassword || !body.newPassword) {
        return ctx.json({ message: 'Ancien et nouveau mot de passe requis' }, 400);
      }
      
      const { currentPassword, newPassword } = body;
      
      // Vérification du mot de passe actuel
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return ctx.json({ message: 'Mot de passe actuel incorrect' }, 400);
      }
      
      // Cryptage et enregistrement du nouveau mot de passe
      user.password = await bcrypt.hash(newPassword, 10);
      await em.persistAndFlush(user);
      
      return ctx.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
      console.error('Change password error:', error);
      return ctx.json({ message: 'Erreur lors du changement de mot de passe' }, 500);
    }
  });

  // Route pour créer un compte administrateur
  router.openapi(createAdminRoute, async (ctx) => {
    try {
      // Vérification que l'utilisateur a les droits d'administrateur
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const currentUser = await em.findOne(User, { id: decoded.id });

      if (!currentUser) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }

      // Vérification du rôle
      if (currentUser.role !== 'admin') {
        return ctx.json({ message: 'Accès refusé - Vous n\'avez pas les privilèges nécessaires' }, 403);
      }      // Alternative approach to validation for admin creation
      const body = await ctx.req.json();
      
      if (!body || !body.email || !body.password || !body.firstName || !body.lastName) {
        return ctx.json({ message: 'Tous les champs requis doivent être remplis' }, 400);
      }
      
      const { email, password, firstName, lastName, birthDate, club, city } = body;
      
      // Vérifier si l'email existe déjà
      const existingUser = await em.findOne(User, { email });
      if (existingUser) {
        return ctx.json({ message: 'Cet email est déjà utilisé' }, 409);
      }
      
      // Cryptage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Création de l'utilisateur administrateur
      const newAdmin = em.create(User, {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'admin',
        birthDate: birthDate ? new Date(birthDate) : undefined,
        club,
        city,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await em.persistAndFlush(newAdmin);
      
      // Retourne les informations de l'administrateur créé (sans le mot de passe)
      return ctx.json({
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role,
        birthDate: newAdmin.birthDate,
        club: newAdmin.club,
        city: newAdmin.city,
        createdAt: newAdmin.createdAt,
        updatedAt: newAdmin.updatedAt,
      }, 201);
    } catch (error) {
      console.error('Create admin error:', error);
      return ctx.json({ message: 'Erreur lors de la création du compte administrateur' }, 500);
    }  });

  // Route pour demander une réinitialisation de mot de passe
  router.openapi(forgotPasswordRoute, async (ctx) => {
    try {
      const body = await ctx.req.json();
      
      if (!body || !body.email) {
        return ctx.json({ message: 'Email requis' }, 400);
      }
      
      const { email } = body;
      const em = ctx.get('em');
      
      // Recherche de l'utilisateur par email
      const user = await em.findOne(User, { email });
      
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      if (!user) {
        // Pour des raisons de sécurité, on renvoie un message générique même si l'email n'existe pas
        return ctx.json({ 
          message: 'Si cette adresse email est associée à un compte, un lien de réinitialisation vous sera envoyé.' 
        });
      }
      
      // Génération d'un token aléatoire
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Définition de l'expiration du token (1 heure)
      const resetTokenExpiration = new Date();
      resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1);
      
      // Sauvegarde du token dans la base de données
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiration;
      
      await em.persistAndFlush(user);
      
      // Envoi de l'email avec Mailjet
      await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.firstName,
        user.lastName
      );
      
      return ctx.json({ 
        message: 'Si cette adresse email est associée à un compte, un lien de réinitialisation vous sera envoyé.' 
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return ctx.json({ message: 'Erreur lors de la demande de réinitialisation du mot de passe' }, 500);
    }
  });
  
  // Route pour réinitialiser le mot de passe avec un token
  router.openapi(resetPasswordRoute, async (ctx) => {
    try {
      const body = await ctx.req.json();
      
      if (!body || !body.token || !body.password) {
        return ctx.json({ message: 'Token et nouveau mot de passe requis' }, 400);
      }
      
      const { token, password } = body;
      const em = ctx.get('em');
      
      // Recherche de l'utilisateur par token
      const user = await em.findOne(User, { 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }  // Vérifie que le token n'a pas expiré
      });
      
      if (!user) {
        return ctx.json({ message: 'Le token est invalide ou a expiré' }, 400);
      }
      
      // Hashage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Mise à jour de l'utilisateur
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;  // Réinitialisation du token
      user.resetPasswordExpires = undefined;  // Réinitialisation de l'expiration
      
      await em.persistAndFlush(user);
      
      // Envoi d'un email de confirmation
      await sendPasswordResetConfirmationEmail(
        user.email,
        user.firstName,
        user.lastName
      );
      
      return ctx.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
      console.error('Reset password error:', error);
      return ctx.json({ message: 'Erreur lors de la réinitialisation du mot de passe' }, 500);
    }
  });

  // Route pour obtenir tous les administrateurs de clubs (super admin uniquement)
  router.openapi(getClubAdminsRoute, async (ctx) => {
    try {
      // Authentification directe
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const currentUser = await em.findOne(User, { id: decoded.id });

      if (!currentUser) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }
      
      // Vérification du rôle
      if (currentUser.role !== 'super_admin') {
        return ctx.json({ message: 'Accès refusé - Vous n\'avez pas les privilèges nécessaires' }, 403);
      }
      
      const clubAdmins = await em.find(User, { role: 'club_admin' });
      
      const response = clubAdmins.map((admin: User) => ({
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        club: admin.club,
        city: admin.city,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }));
      
      return ctx.json(response);
    } catch (error) {
      console.error('Get club admins error:', error);
      return ctx.json({ message: 'Erreur lors de la récupération des administrateurs de clubs' }, 500);
    }
  });

  // Route pour obtenir les membres d'un club (admin de club uniquement)
  router.openapi(getClubMembersRoute, async (ctx) => {
    try {
      // Authentification directe
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const currentUser = await em.findOne(User, { id: decoded.id });

      if (!currentUser) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }
      
      // Vérification du rôle
      if (currentUser.role !== 'club_admin') {
        return ctx.json({ message: 'Accès refusé - Vous n\'avez pas les privilèges nécessaires' }, 403);
      }
      
      const clubMembers = await em.find(User, { 
        club: currentUser.club, 
        role: 'user' 
      });
      
      const response = clubMembers.map((member: User) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        club: member.club,
        city: member.city,
        grade: member.grade,
        approved: member.approved,
        birthDate: member.birthDate,
        role: member.role,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }));
      
      return ctx.json(response);
    } catch (error) {
      console.error('Get club members error:', error);
      return ctx.json({ message: 'Erreur lors de la récupération des membres du club' }, 500);
    }
  });

  // Route pour créer un administrateur de club (super admin uniquement)
  router.openapi(createClubAdminRoute, async (ctx) => {
    try {
      // Authentification directe
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const currentUser = await em.findOne(User, { id: decoded.id });

      if (!currentUser) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }
      
      // Vérification du rôle
      if (currentUser.role !== 'super_admin') {
        return ctx.json({ message: 'Accès refusé - Vous n\'avez pas les privilèges nécessaires' }, 403);
      }
      
      const body = await ctx.req.json();
      
      // Vérifier si l'email existe déjà
      const existingUser = await em.findOne(User, { email: body.email });
      if (existingUser) {
        return ctx.json({ message: 'Un utilisateur avec cet email existe déjà' }, 400);
      }
      
      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      // Création de l'utilisateur
      const newAdmin = em.create(User, {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: hashedPassword,
        club: body.club,
        city: body.city,
        role: 'club_admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await em.persistAndFlush(newAdmin);
      
      // Retourner les données sans le mot de passe
      const response = {
        id: newAdmin.id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        club: newAdmin.club,
        city: newAdmin.city,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
        updatedAt: newAdmin.updatedAt
      };
      
      return ctx.json(response, 201);
    } catch (error) {
      console.error('Create club admin error:', error);
      return ctx.json({ message: 'Erreur lors de la création de l\'administrateur de club' }, 500);
    }
  });

  // Route pour créer un membre de club (admin de club uniquement)
  router.openapi(createClubMemberRoute, async (ctx) => {
    try {
      // Authentification directe
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const currentUser = await em.findOne(User, { id: decoded.id });

      if (!currentUser) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }
      
      // Vérification du rôle
      if (currentUser.role !== 'club_admin') {
        return ctx.json({ message: 'Accès refusé - Vous n\'avez pas les privilèges nécessaires' }, 403);
      }
      
      const body = await ctx.req.json();
      
      // Vérifier si l'email existe déjà
      const existingUser = await em.findOne(User, { email: body.email });
      if (existingUser) {
        return ctx.json({ message: 'Un utilisateur avec cet email existe déjà' }, 400);
      }
      
      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      // Création de l'utilisateur avec le club de l'admin connecté
      const newMember = em.create(User, {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: hashedPassword,
        club: currentUser.club, // Utiliser le club de l'admin connecté
        city: currentUser.city,
        grade: body.grade,
        approved: true, // Les membres créés par l'admin sont automatiquement approuvés
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await em.persistAndFlush(newMember);
      
      // Retourner les données sans le mot de passe
      const response = {
        id: newMember.id,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        club: newMember.club,
        city: newMember.city,
        grade: newMember.grade,
        approved: newMember.approved,
        birthDate: newMember.birthDate,
        role: newMember.role,
        createdAt: newMember.createdAt,
        updatedAt: newMember.updatedAt
      };
      
      return ctx.json(response, 201);
    } catch (error) {
      console.error('Create club member error:', error);
      return ctx.json({ message: 'Erreur lors de la création du membre du club' }, 500);
    }
  });

  // Route pour supprimer un utilisateur (admin uniquement)
  router.openapi(deleteUserRoute, async (ctx) => {
    try {
      // Authentification directe
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const currentUser = await em.findOne(User, { id: decoded.id });

      if (!currentUser) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }
      
      const { id } = ctx.req.valid('param');
      
      // Vérifier les permissions
      if (currentUser.role !== 'super_admin' && currentUser.role !== 'club_admin') {
        return ctx.json({ message: 'Accès refusé - Privilèges d\'administration requis' }, 403);
      }
      
      // Trouver l'utilisateur à supprimer
      const userToDelete = await em.findOne(User, { id: Number(id) });
      if (!userToDelete) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 404);
      }
      
      // Vérifications de sécurité
      if (userToDelete.id === currentUser.id) {
        return ctx.json({ message: 'Vous ne pouvez pas supprimer votre propre compte' }, 400);
      }
      
      // Si club admin, vérifier qu'il ne peut supprimer que les membres de son club
      if (currentUser.role === 'club_admin') {
        if (userToDelete.club !== currentUser.club || userToDelete.role !== 'user') {
          return ctx.json({ message: 'Vous ne pouvez supprimer que les membres de votre club' }, 403);
        }
      }
      
      // Si super admin, vérifier qu'il ne peut pas supprimer un autre super admin
      if (currentUser.role === 'super_admin' && userToDelete.role === 'super_admin') {
        return ctx.json({ message: 'Vous ne pouvez pas supprimer un autre super administrateur' }, 403);
      }
      
      await em.removeAndFlush(userToDelete);
      
      return ctx.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('Delete user error:', error);
      return ctx.json({ message: 'Erreur lors de la suppression de l\'utilisateur' }, 500);
    }
  });

  // Route pour approuver un membre (admin de club uniquement)
  router.openapi(approveMemberRoute, async (ctx) => {
    try {
      // Authentification directe
      const authHeader = ctx.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ctx.json({ message: 'Token non fourni ou format invalide' }, 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const em = ctx.get('em');
      const currentUser = await em.findOne(User, { id: decoded.id });

      if (!currentUser) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 401);
      }
      
      // Vérification du rôle
      if (currentUser.role !== 'club_admin') {
        return ctx.json({ message: 'Accès refusé - Vous devez être administrateur de club' }, 403);
      }
      
      const { id } = ctx.req.valid('param');
      
      // Trouver l'utilisateur à approuver
      const userToApprove = await em.findOne(User, { id: Number(id) });
      if (!userToApprove) {
        return ctx.json({ message: 'Utilisateur non trouvé' }, 404);
      }
      
      // Vérifier que l'utilisateur appartient au même club
      if (userToApprove.club !== currentUser.club) {
        return ctx.json({ message: 'Vous ne pouvez approuver que les membres de votre club' }, 403);
      }
      
      // Vérifier que c'est bien un membre (pas un admin)
      if (userToApprove.role !== 'user') {
        return ctx.json({ message: 'Vous ne pouvez approuver que les membres simples' }, 403);
      }
      
      // Approuver l'utilisateur
      userToApprove.approved = true;
      userToApprove.updatedAt = new Date();
      
      await em.persistAndFlush(userToApprove);
      
      // Retourner les données mises à jour
      const response = {
        id: userToApprove.id,
        firstName: userToApprove.firstName,
        lastName: userToApprove.lastName,
        email: userToApprove.email,
        club: userToApprove.club,
        city: userToApprove.city,
        grade: userToApprove.grade,
        approved: userToApprove.approved,
        birthDate: userToApprove.birthDate,
        role: userToApprove.role,
        createdAt: userToApprove.createdAt,
        updatedAt: userToApprove.updatedAt
      };
      
      return ctx.json({ 
        message: 'Membre approuvé avec succès',
        user: response 
      });
    } catch (error) {
      console.error('Approve member error:', error);
      return ctx.json({ message: 'Erreur lors de l\'approbation du membre' }, 500);
    }
  });

  return router;
}