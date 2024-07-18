import { Flex } from '@radix-ui/themes'
import { createFileRoute, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/notes/empty')({
	component: Component,
})

function Component() {
	const { trash } = useSearch({ from: Route.fullPath })
	return (
		<Flex px="1">
			{trash
				? 'There is nothing here.'
				: 'There is nothign here. Go create a new note.'}
		</Flex>
	)
}
