import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages project site: https://<user>.github.io/LiftingTracker/
export default defineConfig({
  base: '/LiftingTracker/',
  plugins: [react()],
})
