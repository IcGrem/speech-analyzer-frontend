import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'axios': [
            ['default', 'axios']
          ]
        }
      ],
      dts: 'src/auto-imports.d.ts',
      resolvers: [ElementPlusResolver()],
      vueTemplate: true,
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Оптимизация сборки
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'chart': ['chart.js', 'vue-chartjs'],
          'vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  // Настройки сервера разработки
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  // Оптимизация для продакшена
  optimizeDeps: {
    include: ['element-plus', 'chart.js', 'vue-chartjs']
  }
})
