export default {
  apps: [{
    name: 'hotel-management',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://hotel_user:your_secure_password_here@localhost:5432/hotel_management'
    },
    error_file: '/var/log/pm2/hotel-management-error.log',
    out_file: '/var/log/pm2/hotel-management-out.log',
    log_file: '/var/log/pm2/hotel-management.log'
  }]
};
