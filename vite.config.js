import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Expose on all interfaces only when a PORT is injected (hosted/preview envs).
    // Normal `npm run dev` stays localhost-only on 5173.
    host: Boolean(process.env.PORT),
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
