module.exports = {
  apps: [
    {
      name: 'cms-api',
      script: 'server/index.ts',
      interpreter: 'node_modules/.bin/tsx',
      watch: true,
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      max_memory_restart: '1G',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
