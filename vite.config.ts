import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['mmu-icons/*.svg'],
    manifest: {
      name: 'Cálculos Modulares', short_name: 'Cálculos', lang: 'pt-BR',
      description: 'Metas financeiras e cálculos, salvos neste dispositivo.',
      start_url: './', scope: './', display: 'standalone',
      theme_color: '#182b49', background_color: '#f4f6f9',
      icons: [{ src: 'mmu-icons/plus.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'], cleanupOutdatedCaches: true },
  })],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
