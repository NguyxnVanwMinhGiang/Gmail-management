import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  server: {
    host: '127.0.0.1', // Cho phép truy cập qua mạng cục bộ (LAN) hoặc địa chỉ IP
    port: 5173,      // Đổi port mặc định thành 3000
    open: true,      // Tự động mở trình duyệt khi chạy server
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app']
  },
  resolve: {
    alias: {
      // Maps '@' to the 'src' directory
      '@': path.resolve(__dirname, './src'),
      // You can add more specific ones
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
})
