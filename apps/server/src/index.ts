import { buildApp } from './app.ts';
import { openDb } from './db.ts';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
const db = openDb(process.env.DATABASE_PATH ?? 'data/brainreader.sqlite');

const { fastify } = buildApp({ db });

try {
  await fastify.listen({ port, host });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
