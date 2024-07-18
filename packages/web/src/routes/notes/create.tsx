import { getUUID } from '@/utils/uuid'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

import { EditorCreate } from './-editor'

export const Route = createFileRoute('/notes/create')({
	component: Component,
	loader: getUUID,
})

function Component() {
	const id = useLoaderData({ from: Route.fullPath })
	// we assert this because we have had issues with the loader not firing
	if (!id) throw new Error('id is required')
	return <EditorCreate id={id} />
}
