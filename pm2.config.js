module.exports = {
    apps: [
      {
        name: 'pm2-ckdr',
        script: './src/server/worker.ts',
        instances: 'max',
        exec_mode: 'cluster',
      },
    ],
  };