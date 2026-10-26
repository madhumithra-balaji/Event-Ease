import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './src/server/db.js';
import { startExpirationWorker } from './src/server/jobs/expirationWorker.js';
import { authRouter } from './src/server/routes/auth.js';
import { eventsRouter } from './src/server/routes/events.js';
import { ticketsRouter } from './src/server/routes/tickets.js';
import { reservationsRouter } from './src/server/routes/reservations.js';
import { paymentsRouter } from './src/server/routes/payments.js';
import { ordersRouter } from './src/server/routes/orders.js';
import { analyticsRouter } from './src/server/routes/analytics.js';
import { adminRouter } from './src/server/routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Initialize persistent DB & seed data
  initDatabase();

  // Start background ticket reservation hold expiration worker (runs every 5 seconds)
  startExpirationWorker(5000);

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API Endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api', ticketsRouter);
  app.use('/api/reservations', reservationsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/admin', adminRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'EventEase API Gateway & Reservation Engine',
    });
  });

  // Frontend integration: Vite middleware in development, static files in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('Mounting Vite dev server middleware...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static build from dist/...');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EventEase fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting EventEase server:', err);
  process.exit(1);
});
