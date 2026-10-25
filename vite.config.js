import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two pages: the landing page and the library room.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        library: resolve(__dirname, 'library/index.html'),
      },
    },
  },
});
