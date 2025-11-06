import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Set base to the repo name so assets load correctly when deployed to GitHub Pages
  base: '/CPM-NEW/',
  plugins: [react()],
})
