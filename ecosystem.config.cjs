module.exports = {
  apps: [{
    name: "gcfm-library",
    script: "./server/index.ts",
    interpreter: "node",
    interpreter_args: "--import tsx",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
