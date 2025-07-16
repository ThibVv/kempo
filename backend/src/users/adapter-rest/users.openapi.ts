// filepath: c:\Users\tverb\Documents\projet\app\backend\src\users\adapter-rest\users.openapi.ts
import { createRoute, z } from '@hono/zod-openapi';
import {
  AuthResponseSchema,
  LoginUserSchema,
  RegisterUserSchema,
  UserSchema,
  CreateAdminSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema
} from './users.schema.ts';

// Route pour l'enregistrement d'un nouveau utilisateur
export const registerUserRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: AuthResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid input data',
    },
    409: {
      description: 'Email already exists',
    },
  },
});

// Route pour la connexion d'un utilisateur
export const loginUserRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User logged in successfully',
      content: {
        'application/json': {
          schema: AuthResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid credentials',
    },
  },
});

// Route pour récupérer le profil de l'utilisateur connecté
export const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'User profile retrieved successfully',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing token',
    },
  },
});

// Route pour mettre à jour le profil utilisateur
export const updateProfileRoute = createRoute({
  method: 'put',
  path: '/update',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User profile updated successfully',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    400: {
      description: 'Invalid input data',
    },
    401: {
      description: 'Unauthorized - Invalid or missing token',
    },
    409: {
      description: 'Email already exists',
    },
  },
});

// Route pour changer le mot de passe
export const changePasswordRoute = createRoute({
  method: 'put',
  path: '/password',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ChangePasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password changed successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid current password',
    },
    401: {
      description: 'Unauthorized - Invalid or missing token',
    },
  },
});

// Route pour créer un compte administrateur
export const createAdminRoute = createRoute({
  method: 'post',
  path: '/create-admin',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateAdminSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Admin user created successfully',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    400: {
      description: 'Invalid input data',
    },
    401: {
      description: 'Unauthorized - Invalid or missing token',
    },
    403: {
      description: 'Forbidden - User does not have admin privileges',
    },
    409: {
      description: 'Email already exists',
    },
  },
});

// Route pour demander une réinitialisation de mot de passe
export const forgotPasswordRoute = createRoute({
  method: 'post',
  path: '/forgot-password',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ForgotPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset email sent successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid input data',
    },
    500: {
      description: 'Server error',
    },
  },
});

// Route pour réinitialiser le mot de passe
export const resetPasswordRoute = createRoute({
  method: 'post',
  path: '/reset-password',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ResetPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successful',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid or expired token',
    },
    500: {
      description: 'Server error',
    },
  },
});

// Route pour obtenir tous les administrateurs de clubs (super admin uniquement)
export const getClubAdminsRoute = createRoute({
  method: 'get',
  path: '/club-admins',
  tags: ['Users'],
  responses: {
    200: {
      description: 'List of club administrators',
      content: {
        'application/json': {
          schema: z.array(UserSchema),
        },
      },
    },
    403: {
      description: 'Forbidden - Super admin access required',
    },
  },
});

// Route pour obtenir les membres d'un club (admin de club uniquement)
export const getClubMembersRoute = createRoute({
  method: 'get',
  path: '/club-members',
  tags: ['Users'],
  responses: {
    200: {
      description: 'List of club members',
      content: {
        'application/json': {
          schema: z.array(UserSchema),
        },
      },
    },
    403: {
      description: 'Forbidden - Club admin access required',
    },
  },
});

// Route pour créer un administrateur de club (super admin uniquement)
export const createClubAdminRoute = createRoute({
  method: 'post',
  path: '/create-club-admin',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateAdminSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Club administrator created successfully',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - Super admin access required',
    },
    400: {
      description: 'Bad request - Invalid data',
    },
  },
});

// Route pour créer un membre de club (admin de club uniquement)
export const createClubMemberRoute = createRoute({
  method: 'post',
  path: '/create-club-member',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Club member created successfully',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - Club admin access required',
    },
    400: {
      description: 'Bad request - Invalid data',
    },
  },
});

// Route pour supprimer un utilisateur (admin uniquement)
export const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Users'],
  request: {
    params: z.object({
      id: z.string().transform(Number),
    }),
  },
  responses: {
    200: {
      description: 'User deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Forbidden - Admin access required',
    },
    404: {
      description: 'User not found',
    },
  },
});

// Route pour approuver un membre
export const approveMemberRoute = createRoute({
  method: 'patch',
  path: '/{id}/approve',
  tags: ['Users'],
  request: {
    params: z.object({
      id: z.string().transform(Number),
    }),
  },
  responses: {
    200: {
      description: 'Member approved successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            user: UserSchema,
          }),
        },
      },
    },
    403: {
      description: 'Forbidden - Club admin access required',
    },
    404: {
      description: 'User not found',
    },
  },
});