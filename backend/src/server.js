import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import crypto from 'node:crypto';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import imageCommentRoutes from './routes/imageCommentRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:4173,http://127.0.0.1:4173')
  .split(',').map(v => v.trim()).filter(Boolean);

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
app.use(helmet({ contentSecurityPolicy: false })); // JSON-only API; CSP belongs on the HTML-serving frontend (see deploy/nginx.conf)
app.use(compression());
app.use(cors({ origin: allowedOrigins, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','X-Request-Id'] }));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(apiLimiter);

app.get('/api/health', (req, res) => res.json({ success: true, data: { service: 'claymarket-api', status: 'ok', timestamp: new Date().toISOString(), requestId: req.id } }));
app.get('/api/ready', async (req, res) => {
  res.status(200).json({ success: true, data: { database: 'firestore', status: 'ready', timestamp: new Date().toISOString(), requestId: req.id } });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/conversations', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/image-comments', imageCommentRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
let server;

async function start() {
  await connectDB();
  server = app.listen(port, () => console.log(`Claymarket API running on port ${port}`));
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  if (server) await new Promise(resolve => server.close(resolve));
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', error => { console.error('Unhandled rejection:', error); process.exit(1); });
process.on('uncaughtException', error => { console.error('Uncaught exception:', error); process.exit(1); });

start().catch(error => { console.error(`Backend startup failed: ${error.message}`); process.exit(1); });

export default app;
