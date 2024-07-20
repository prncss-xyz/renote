import { SearchTag } from '@/core/noteSelection'
import { useHotkeyHandler } from '@/hooks/hotkey'
import { normalizeQuery } from '@/utils/normalize'
import { Box, Button, Flex, Popover, TextField } from '@radix-ui/themes'
import { useRouter, useSearch } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { useProcessedNotes } from './-processedNotes/hooks'

function Tag({ tag }: { tag: string }) {
	if (tag === SearchTag.NO_SELECTION || tag === SearchTag.UNTAGGED) {
		return (
			<Box>
				<i>{toName(tag)}</i>
			</Box>
		)
	}
	return <Box>{tag}</Box>
}

function toName(tag: string) {
	if (tag === SearchTag.UNTAGGED) {
		return 'Untagged'
	}
	if (tag === SearchTag.NO_SELECTION) {
		return 'No selection'
	}
	return tag
}

const localBindings = {
	confirm: { key: 'Enter' },
}

function Contents({ close }: { close: () => void }) {
	const { onKeyDown, useRegister } = useHotkeyHandler(localBindings)
	const allTags = useProcessedNotes((state) => state.allTags)
	const opts = [SearchTag.NO_SELECTION, SearchTag.UNTAGGED, ...allTags]
	const [query, setQuery] = useState('')
	const filteredTags = opts.filter((tag) =>
		normalizeQuery(toName(tag)).includes(normalizeQuery(query)),
	)
	const { navigate } = useRouter()
	const select = useCallback(
		(tag: string) => {
			navigate({ search: (search) => ({ ...search, tag }) })
			close()
		},
		[close, navigate],
	)
	useRegister(
		'confirm',
		useCallback(() => {
			const tag = filteredTags.at(0)
			if (tag !== undefined) select(tag)
		}, [filteredTags, select]),
	)
	return (
		<Flex direction="column" gap="3">
			<TextField.Root
				placeholder="Select tags"
				value={query}
				onKeyDown={onKeyDown}
				onChange={(e) => setQuery(e.target.value)}
			></TextField.Root>
			<Flex direction="column" gap="1">
				{filteredTags.map((tag) => (
					<Button key={tag} variant="ghost" onClick={() => select(tag)}>
						<Flex direction="row" width="100%">
							<Tag key={tag} tag={tag} />
						</Flex>
					</Button>
				))}
			</Flex>
		</Flex>
	)
}

export function Selector() {
	const { tag } = useSearch({ from: '/notes/_layout' })
	const [open, setOpen] = useState(false)
	const close = useCallback(() => setOpen(false), [])
	return (
		<Flex direction="column">
			<Popover.Root open={open} onOpenChange={setOpen}>
				<Popover.Trigger>
					<Button variant={tag ? 'solid' : 'outline'}>
						<Flex direction="row" justify="between" width="100%">
							<Box>Tags</Box>
							{tag && <Tag tag={tag} />}
						</Flex>
					</Button>
				</Popover.Trigger>
				<Popover.Content>
					<Contents close={close} />
				</Popover.Content>
			</Popover.Root>
		</Flex>
	)
}
