import migrationRunner from 'node-pg-migrate';
import { join } from 'node:path';

async function migrations(request, response) {
  if (request.method === 'GET')
    console.log('GET:');
  else if (request.method === 'POST')
    console.log('POST:');
  else
    return response.status(405).json({ message: 'Method not allowed' });

  const migrations = await migrationRunner({
    dir: join('infra', 'migrations'),
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    direction: 'up',
    verbose: true,
    migrationsTable: 'pgmigrations'
  })
  return response.status(200).json(migrations);
}

export default migrations;
