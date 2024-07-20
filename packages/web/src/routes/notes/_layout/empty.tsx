import { Flex } from '@radix-ui/themes'
import { createFileRoute, useSearch } from '@tanstack/react-router'

import { NavNotes } from './-editor/navNotes'

export const Route = createFileRoute('/notes/_layout/empty')({
	component: Component,
})

const from = '/notes/_layout/empty'

function Component() {
	const { trash } = useSearch({ from })
	return (
		<Flex direction="column" gap="2" flexGrow="1">
			<NavNotes id="" deleted={false} archived={false} />
			<Flex px="1" justify="center">
				{trash
					? 'There is nothing here.'
					: 'There is nothign here. Go create a new note.'}
			</Flex>
		</Flex>
	)
}
