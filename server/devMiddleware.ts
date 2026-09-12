import { Plugin } from 'vite';

/**
 * CareOn Dev Server API Middleware
 * Only used during local development (`vite` / `vite preview`) in container.
 * In Netlify production, API requests are handled by Netlify Functions (`netlify/functions/api.ts`).
 */
export function careonDevMiddlewarePlugin(): Plugin {
  return {
    name: 'careon-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        try {
          const { handleApiRequest } = await import('./apiHandler');
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
          const { handleApiRequest } = await import('./apiHandler');
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
