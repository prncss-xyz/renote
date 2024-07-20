import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// this is specific to the github pages

function getBasePath() {
	const repo = process.env.GITHUB_REPOSITORY
	if (!repo) return undefined
	const [, name] = repo.split('/')
	if (!name) return undefined
	return `/${name}`
}

// https://vitejs.dev/config/
export default defineConfig({
	base: getBasePath(),
	plugins: [TanStackRouterVite(), react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
