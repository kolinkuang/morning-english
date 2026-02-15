import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/morning-english/',
    plugins: [react()],
    server: {
        proxy: {
            // 代理 API 请求到后端服务
            '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'axios']
                }
            }
        }
    }
});