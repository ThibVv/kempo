import { OpenAPIHono } from "@hono/zod-openapi";
import { Connection, MikroORM, MySqlDriver, type EntityManager, type IDatabaseDriver } from "@mikro-orm/mysql";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import mikroOrmConfig from "../mikro-orm.config.ts";


export type AppEnv = {
    Variables: {
      em: EntityManager
    }
  }

export function getApp() {
    const app = new OpenAPIHono<AppEnv>();
    
    // Healthcheck endpoint simple pour Render
    app.get('/health', (c) => {
      return c.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });
    
    return app;
}