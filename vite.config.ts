import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset paths work both at a domain root and under a GitHub Pages repository path.
export default defineConfig({ plugins: [react()], base: '/feature-lifting-explainer/', })
