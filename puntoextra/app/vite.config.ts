import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // rutas relativas: funciona en Capacitor y bajo /app/ en el portal web
  server: { port: 5174 },
  build: { outDir: 'dist' },
})
