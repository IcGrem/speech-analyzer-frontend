import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import tailwind from '@tailwindcss/vite'
import { loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	const proxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || 'http://localhost:8000'

	return {
		base: './',
		plugins: [
			tailwind(),
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
			minify: 'terser',
			chunkSizeWarningLimit: 1000
		},
		// Настройки сервера разработки
		server: {
			port: 3000,
			open: true,
			cors: true,
			proxy: {
                '/api': { target: proxyTarget, changeOrigin: true, secure: false },
				'/employees': { target: proxyTarget, changeOrigin: true, secure: false },
				'/dialogs': { target: proxyTarget, changeOrigin: true, secure: false },
				'/organizations': { target: proxyTarget, changeOrigin: true, secure: false },
				'/users': { target: proxyTarget, changeOrigin: true, secure: false },
			}
		},
		// Оптимизация для продакшена
		optimizeDeps: {
			include: ['element-plus', 'chart.js', 'vue-chartjs']
		}
	}
})
