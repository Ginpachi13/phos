import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Pages: the landing page, the library room and food and drinks.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        library: resolve(__dirname, 'library/index.html'),
        food: resolve(__dirname, 'food-and-drinks/index.html'),
      },
    },
  },
});
