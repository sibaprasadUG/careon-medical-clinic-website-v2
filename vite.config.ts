import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, PluginOption } from 'vite';

export default defineConfig(async ({ command }) => {
  const plugins: PluginOption[] = [react(), tailwindcss()];

  // Only load local dev server API middleware during local dev/preview
  if (command === 'serve') {
    const { careonDevMiddlewarePlugin } = await import('./server/devMiddleware');
    plugins.push(careonDevMiddlewarePlugin());
  }

  return {
    plugins,
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
