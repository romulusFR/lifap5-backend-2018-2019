module.exports = {
  apps: [
    {
      name: "lifap5-prod",
      script: "server.js",
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      exec_mode: "cluster",
      merge_logs: true,
      env: {
        NODE_ENV: "production"
        // DEBUG:"lifap5:*"
      }
    }
  ]
};
