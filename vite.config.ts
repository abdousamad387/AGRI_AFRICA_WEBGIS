import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/AGRI_AFRICA_WEBGIS/',
  server: { port: 4000 },
})
