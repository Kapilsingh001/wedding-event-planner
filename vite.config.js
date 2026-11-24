import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The public address of the website. index.html needs it for the link preview
// picture, because WhatsApp only accepts a full address (https://...).
// Vercel gives the address in VERCEL_PROJECT_PRODUCTION_URL when it builds the
// site. It can also be set by hand as VITE_SITE_URL. On a laptop it stays empty.
if (!process.env.VITE_SITE_URL) {
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL
  process.env.VITE_SITE_URL = vercelDomain ? `https://${vercelDomain}` : ''
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The website answers on http://localhost:5173 and http://127.0.0.1:5173.
  // Invitation links use a real domain name that points back to this computer
  // (see src/services/siteUrl.js), because WhatsApp only makes real domain
  // names clickable. allowedHosts lets Vite answer when it is opened by that name.
  server: {
    host: '127.0.0.1',
    allowedHosts: ['.localtest.me'],
  },
  // Vitest reads this part: a fake browser (jsdom) for the tests
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
