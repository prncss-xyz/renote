import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// bump
console.log('>>> BASE_PATH: %s', process.env.BASE_PATH)

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.BASE_PATH,
	plugins: [TanStackRouterVite(), react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
