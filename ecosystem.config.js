module.exports = {
  apps: [
    //First Application
    {
      name: 'screenshot',
      script: 'server.js',
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }],

  deploy: {
    production: {
      user: 'root',
      host: '192.168.195.5',
      ref: 'origin/master',
      repo: 'https://github.com/Amoylee49/screenshot.git',
      path: '/root/pm2/screenshot',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    dev: {}
  }
};
