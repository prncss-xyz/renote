import { selectNotesOptsSchema } from '@/core/noteSelection'
import { ensureNotesMeta } from '@/db'
import { Box, Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet, useSearch } from '@tanstack/react-router'

import './notes.css'

import { NotesSelector } from './_layout/-notesSelector'
import { ProcessedNotesProvider } from './_layout/-processedNotes/provider'

export const Route = createFileRoute('/notes/_layout')({
	component: Component,
	loader: ({ context: { queryClient } }) => ensureNotesMeta(queryClient),
	validateSearch: selectNotesOptsSchema,
})

const from = '/notes/_layout'

export function Component() {
	const search = useSearch({ from })
	return (
		<ProcessedNotesProvider search={search}>
			<Flex gap="3" flexGrow="1">
				<Box display={{ initial: 'none', sm: 'block' }}>
					<NotesSelector />
				</Box>
				<Flex flexGrow="1">
					<Outlet />
				</Flex>
			</Flex>
		</ProcessedNotesProvider>
	)
}
