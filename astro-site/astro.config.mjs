import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://berega.example.com',
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'zh'],
    routing: { prefixDefaultLocale: false }
  },
  image: {
    domains: ['homereserve.ru']
  },
  vite: {
    server: { port: 4321 }
  }
});
