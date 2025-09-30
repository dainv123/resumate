module.exports = {
  apps: [
    {
      name: 'resumate-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: 5000,
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'resumate-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:prod',
      env: {
        PORT: 5001,
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};