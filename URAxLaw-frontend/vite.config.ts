import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['uraxlaw.anh2english.com', 'd0c20334cb9f.ngrok-free.app'],
  },
})
