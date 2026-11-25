/**
 * REALCRED TECHNOLOGY PRIVATE LIMITED - PM2 ECOSYSTEM CONFIGURATION
 * For High-Availability Production Cluster Management
 */

module.exports = {
  apps: [
    {
      name: 'realcred-backend',
      script: './backend/server.js',
      instances: 'max', // Scale to available CPU cores in cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
