import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/')({
	component: Component,
	validateSearch: z.object({ path: z.string().catch('') }),
})

// this is to support github pages
// https://github.com/rafgraph/spa-github-pages/blob/gh-pages/index.html#L21-L42
function decodePath(path: string) {
	return path
		.slice(1)
		.split('&')
		.map(function (s) {
			return s.replace(/~and~/g, '&')
		})
		.join('?')
}

function Component() {
	const { path } = useSearch({ from: Route.fullPath })
	const to = path ? decodePath(path) : '/notes'
	return <Navigate to={to} replace={true} />
}
