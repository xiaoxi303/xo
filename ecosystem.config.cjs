module.exports = {
  apps: [
    {
      name: 'xo-studio',
      script: './.output/server/index.mjs',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1'
      }
    }
  ]
}
