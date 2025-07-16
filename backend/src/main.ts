import { serve } from '@hono/node-server'
import { registerAppRoutes } from './api/register-app-routes.ts'
import { getApp } from './api/get-app.ts'
import { EntityManager } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config.ts';
import { Tournament } from './entities/Tournament.entity.ts';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import * as dotenv from 'dotenv';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

const orm = await MikroORM.init(config);
const em = orm.em;

const httpApp = getApp();


httpApp.use(contextStorage())

httpApp.use(async (c, next) => {
  c.set('em', em)
  await next()
})

// Configuration CORS plus permissive pour le développement
httpApp.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

const app = registerAppRoutes(httpApp)



serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
  console.log(`API documentation is available on http://localhost:${info.port}/docs`)
})