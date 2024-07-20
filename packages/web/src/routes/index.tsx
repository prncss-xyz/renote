import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
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
	const to = `${import.meta.env.BASE_URL}/${path ? decodePath(path) : '/notes'}`
	// __AUTO_GENERATED_PRINT_VAR_START__
	console.log('Component to: %s', to) // __AUTO_GENERATED_PRINT_VAR_END__
	useEffect(() => {
		console.log('effect')
		window.location.replace(to)
	}, [to])
	return null
}
