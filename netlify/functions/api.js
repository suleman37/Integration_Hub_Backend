const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import your routes
const authRoutes = require('../../src/modules/auth/routes');
const userRoutes = require('../../src/modules/user/routes');
const connectionRoutes = require('../../src/modules/connection/routes');
const integrationRoutes = require('../../src/modules/integration/routes');
const adaptorRoutes = require('../../src/modules/adaptor/routes');
const adminRoutes = require('../../src/modules/admin/routes');
const automationRuleRoutes = require('../../src/modules/automation-rule/routes');
const fileRoutes = require('../../src/modules/file/routes');
const fileIntegrationRoutes = require('../../src/modules/file-integration/routes');
const orderRoutes = require('../../src/modules/order/routes');
const saleforceRoutes = require('../../src/modules/salesforce/routes');
const webhookRoutes = require('../../src/modules/webhook/routes');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(hpp());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/adaptors', adaptorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/automation-rules', automationRuleRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/file-integrations', fileIntegrationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/salesforce', saleforceRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export for Netlify using serverless-http
module.exports.handler = serverless(app); 