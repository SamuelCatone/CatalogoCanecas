import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  // Default to PORT env variable (e.g. PORT=5000 in Docker), 5000 in production, or 3000 in dev
  const PORT = Number(process.env.PORT) || (process.env.NODE_ENV === 'production' ? 5000 : 3000);
  const APP_URL = process.env.APP_URL || process.env.APP_EXTERNAL_URL || 'https://catalogo-canecas.vps9669.panel.icontainer.net';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS middleware allowing web requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Health and Status Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'MugCraft Backend API',
      timestamp: new Date().toISOString(),
      url: APP_URL,
    });
  });

  app.get('/api/info', (req, res) => {
    res.json({
      name: 'Catálogo de Canecas API',
      version: '1.0.0',
      host: 'VM Container',
      domain: 'catalogo-canecas.vps9669.panel.icontainer.net',
      url: APP_URL,
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Vite middleware in development vs Static files in production (Render)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MugCraft Server] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[MugCraft Server] Domain URL: ${APP_URL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
