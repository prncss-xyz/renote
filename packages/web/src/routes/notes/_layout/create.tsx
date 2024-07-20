import { getUUID } from '@/utils/uuid'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

import { EditorCreate } from './-editor'

export const Route = createFileRoute('/notes/_layout/create')({
	component: Component,
	loader: getUUID,
})

const from = '/notes/_layout/create'

function Component() {
	const id = useLoaderData({ from })
	// we assert this because we have had issues with the loader not firing
	if (!id) throw new Error('id is required')
	return <EditorCreate id={id} />
}
