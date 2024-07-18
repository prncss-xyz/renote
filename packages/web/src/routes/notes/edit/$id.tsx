import {
	ensureNoteContents,
	ensureNotesMeta,
	useNoteContents,
	useNoteMeta,
} from '@/db/index'
import { ensureDefined } from '@/utils/ensureDefined'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Editor } from '../-editor'

export const Route = createFileRoute('/notes/edit/$id')({
	component: Component,
	loader: ({ params: { id }, context: { queryClient } }) =>
		Promise.all([
			ensureNotesMeta(queryClient),
			ensureNoteContents(queryClient, id),
		]),
})

export function Component() {
	const { id } = Route.useParams()
	return <Note key={id} id={id} />
}

export function Note({ id }: { id: string }) {
	// when using a loader insteat of hooks, loader doesn't run on redirect, unless nativage is wrapped
	// in a timout; also prevents from using links

	// this is useful to prevent rerendering when data change is caused by an external event
	// which is currently not hapenning
	const [meta] = useState(ensureDefined(useNoteMeta(id)).data)
	const [contents] = useState(useNoteContents(id).data)
	if (!meta?.btime) return <Navigate to={`/notes/edit/${id}`} />
	return (
		<Editor meta={meta} contents={contents} editable={true} deleted={false} />
	)
}
