import { selectNotesOptsSchema } from '@/core/noteSelection'
import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router'

import { useProcessedNotes } from './-processedNotes/hooks'
import { ProcessedNotesProvider } from './-processedNotes/provider'

export const Route = createFileRoute('/notes/_layout/')({
	component: Component,
	validateSearch: selectNotesOptsSchema,
})

const from = '/notes/_layout/'

function Redirect() {
	const search = useSearch({ from })
	const notes = useProcessedNotes((state) => state.notes)
	const id = notes[0]?.id
	if (id)
		return <Navigate to={'/notes/view/$id'} params={{ id }} search={search} />
	return <Navigate to={'/notes/empty'} search={search} />
}

export function Component() {
	const search = useSearch({ from })
	return (
		<ProcessedNotesProvider search={search}>
			<Redirect />
		</ProcessedNotesProvider>
	)
}
