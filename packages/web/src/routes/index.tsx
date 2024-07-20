import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/')({
	component: Component,
	validateSearch: z.object({
		to: z.string().catch('/notes'),
	}),
})

function Component() {
	const { to } = useSearch({ from: Route.fullPath })
	return <Navigate to={to} />
}
