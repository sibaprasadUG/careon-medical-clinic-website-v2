import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleApiRequest } from './src/server/apiHandler';

function careonApiPlugin(): Plugin {
  return {
    name: 'careon-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        try {
          let body: any = undefined;
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(chunk as Buffer);
            }
            const rawBody = Buffer.concat(buffers).toString('utf-8');
            try {
              body = JSON.parse(rawBody);
            } catch {
              body = rawBody;
            }
          }

          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);

          const response = await handleApiRequest({
            method: req.method || 'GET',
            path: urlObj.pathname,
            headers: req.headers as Record<string, string>,
            body,
            query: Object.fromEntries(urlObj.searchParams.entries())
          });

          res.statusCode = response.statusCode;
          if (response.headers) {
            for (const [key, val] of Object.entries(response.headers)) {
              res.setHeader(key, val);
            }
          }
          res.end(response.body);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        try {
          let body: any = undefined;
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(chunk as Buffer);
            }
            const rawBody = Buffer.concat(buffers).toString('utf-8');
            try {
              body = JSON.parse(rawBody);
            } catch {
              body = rawBody;
            }
          }

          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);

          const response = await handleApiRequest({
            method: req.method || 'GET',
            path: urlObj.pathname,
            headers: req.headers as Record<string, string>,
            body,
            query: Object.fromEntries(urlObj.searchParams.entries())
          });

          res.statusCode = response.statusCode;
          if (response.headers) {
            for (const [key, val] of Object.entries(response.headers)) {
              res.setHeader(key, val);
            }
          }
          res.end(response.body);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), careonApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
