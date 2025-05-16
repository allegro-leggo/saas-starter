import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const postgresUrl = process.env.POSTGRES_URL;

// Initialize client and db
let client: Sql<{}>;
let db: PostgresJsDatabase<typeof schema>;

if (!postgresUrl) {
  console.warn(
    'WARNING: POSTGRES_URL environment variable is not set. ' +
    'Database client will not be initialized properly. ' +
    'This will cause errors if database access is attempted during the build or at runtime. ' +
    'Ensure POSTGRES_URL is set in your environment, especially for production and build processes.'
  );

  // Create a proxy that throws an error if any method is called on client or db
  const uninitializedDbProxyHandler = {
    get: function(target: any, prop: string | symbol) {
      // Allow certain introspective properties to pass through if needed (e.g. for some dev tools or checks)
      if (prop === 'then' || prop === 'catch' || prop === 'finally' || typeof prop === 'symbol' || prop === 'constructor' || prop === 'prototype') {
        return undefined;
      }
      // More specific check to avoid issues with Next.js internals trying to check object type
      if (prop === '_isMockFunction' || prop === 'inspect' || prop === 'constructor') {
         return undefined;
      }
      throw new Error(
        `Attempted to access '${String(prop)}' on the database client/instance, ` +
        'but POSTGRES_URL environment variable was not set. Please ensure it is configured.'
      );
    }
  };
  client = new Proxy({} as Sql<{}>, uninitializedDbProxyHandler);
  db = new Proxy({} as PostgresJsDatabase<typeof schema>, uninitializedDbProxyHandler);

} else {
  client = postgres(postgresUrl);
  db = drizzle(client, { schema });
}

export { client, db };
