import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/environment.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import websiteRoutes from './routes/websiteRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import callbackRoutes from './routes/callbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import loanCategoryRoutes from './routes/loanCategoryRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { createInitialAdmin } from './scripts/createAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and standard middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Block direct static access to customer KYC documents (served only via authenticated streaming routes)
app.use('/uploads/documents', (req, res) => {
  return res.status(403).json({
    status: 'error',
    message: 'Direct access to KYC documents is forbidden. Please access documents through authenticated API endpoints (/api/documents/:id/view or /api/documents/:id/download).',
  });
});

// Static folder for general uploaded assets (invoices, avatars, bank logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    company: 'RealCred Technology Private Limited',
    brand: 'RealCred',
    tagline: 'Your Loan. One Guided Route.',
    domain: 'https://realcred.in',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    database: 'Connected to local MongoDB (realcred)'
  });
});

// Root API welcome endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to RealCred Technology Private Limited API Gateway',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      website: '/api/website',
      loans: '/api/loans',
      banks: '/api/banks',
      admin: '/api/admin',
      employees: '/api/employees',
      partners: '/api/partners',
      leads: '/api/leads',
      callbacks: '/api/callbacks',
      payouts: '/api/payouts',
      invoices: '/api/invoices',
      notifications: '/api/notifications'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/website', websiteRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/loan-categories', loanCategoryRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/callbacks', callbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API Route not found: ${req.originalUrl}`
  });
});

// Production: Serve static Frontend Vite build and SPA fallback for client routes
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[RealCred Server Error]', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await createInitialAdmin();
    const server = app.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(` REALCRED TECHNOLOGY PRIVATE LIMITED - API BACKEND`);
      console.log(` Tagline: Your Loan. One Guided Route.`);
      console.log(` Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      console.log(` Health Check: http://localhost:${ENV.PORT}/api/health`);
      console.log(` Client URL: ${ENV.CLIENT_URL}`);
      console.log(`=======================================================`);
    });
    return server;
  } catch (error) {
    console.error('Failed to initialize server due to database connection error:', error.message);
    process.exit(1);
  }
};

const isTestRunner = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));
if (!isTestRunner) {
  startServer();
}

export default app;
