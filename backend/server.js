import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pricingRoutes from './routes/pricingRoutes.js';
import howItWorksRoutes from './routes/howItWorksRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import caseStudyRoutes from './routes/caseStudyRoutes.js';
import heroRoutes from './routes/heroRoutes.js';
import whyChooseUsRoutes from './routes/whyChooseUsRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import finalCtaRoutes from './routes/finalCtaRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { tenantMiddleware } from './middleware/tenantMiddleware.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
// CORS: allow configured origins or common localhost Vite dev ports
const configuredOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) || [];
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);

    // Wildcard support via env
    if (configuredOrigins.includes('*')) return callback(null, true);

    // Allow ALL localhost ports for development (more lenient)
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);

    // Allow common Vite dev ports
    if (/^http:\/\/localhost:517\d$/.test(origin)) return callback(null, true);

    // Allow any explicitly configured origins
    if (configuredOrigins.includes(origin)) return callback(null, true);

    // In development, be more lenient
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️  CORS: Allowing origin in dev mode: ${origin}`);
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(tenantMiddleware);

app.use('/api/pricing', pricingRoutes);
app.use('/api/how-it-works', howItWorksRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/why-choose-us', whyChooseUsRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/final-cta', finalCtaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Redirect /admin to the frontend app's admin pricing route
const FRONTEND_ORIGIN = (process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173').trim();
app.get('/admin', (_req, res) => {
  res.redirect(`${FRONTEND_ORIGIN}/admin/pricing`);
});

const PORT = process.env.PORT || 5001;

async function start() {
  const corsOrigins = configuredOrigins.length ? configuredOrigins : ['(dev: localhost:517x)'];
  const adminTokenSet = !!process.env.ADMIN_TOKEN;

  app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Server started successfully!');
    console.log(`🌐 Server listening on port ${PORT}`);
    console.log(`📋 CORS origins: ${corsOrigins.join(', ')}`);
    console.log(`🔐 ADMIN_TOKEN configured: ${adminTokenSet ? 'yes' : 'no'}`);
    console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

start();
