import base from '../vite.config.js';
export default {
  ...base,
  plugins: [
    ...base.plugins,
    {
      name: 'browser-test-shutdown',
      configureServer(server) {
        server.middlewares.use('/__test/shutdown', (_req, res) => {
          res.end('Stopping');
          setTimeout(() => process.exit(0), 50);
        });
      },
    },
  ],
  server: { ...base.server, host: '127.0.0.1' },
};
