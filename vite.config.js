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
  // The website answers on http://127.0.0.1:5173 and http://localhost:5173.
  // WhatsApp makes a link clickable only when it has a number address or a real
  // domain, never "localhost". So invitation links use the 127.0.0.1 address.
  server: {
    host: '127.0.0.1',
  },
  // Vitest reads this part: a fake browser (jsdom) for the tests
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
