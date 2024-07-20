import { Flex } from '@radix-ui/themes'
import { createFileRoute, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/notes/_layout/empty')({
	component: Component,
})

// FIX: Route.fullPath is undefined
const from = '/notes/_layout/empty'

function Component() {
	const { trash } = useSearch({ from })
	return (
		<Flex px="1">
			{trash
				? 'There is nothing here.'
				: 'There is nothign here. Go create a new note.'}
		</Flex>
	)
}
