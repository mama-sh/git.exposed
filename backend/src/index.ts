import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://git.exposed', 'https://viral-vibecoding.vercel.app', 'http://localhost:3000'],
}));

app.get('/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 4000;
console.log(`Scanner backend running on port ${port}`);
serve({ fetch: app.fetch, port });

export default app;
