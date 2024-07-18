import { NoteMeta } from '@/core/models'
import { useNoteMeta, useUpsertNoteMetaValue } from '@/db'
import { useHotkeyHandler } from '@/hooks/hotkey'
import { matchQuery } from '@/utils/normalize'
import { useReset } from '@/utils/reset'
import {
	Cross2Icon,
	MagnifyingGlassIcon,
	Pencil1Icon,
	PlusIcon,
} from '@radix-ui/react-icons'
import {
	Badge,
	Box,
	Button,
	Checkbox,
	DataList,
	Dialog,
	Flex,
	IconButton,
	TextField,
	Tooltip,
	VisuallyHidden,
} from '@radix-ui/themes'
import { Link, useSearch } from '@tanstack/react-router'
import { dequal } from 'dequal'
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'

import { useProcessedNotes } from '../-processedNotes/hooks'

function TagBadge({ name }: { name: string }) {
	const search = useSearch({ from: '/notes' })
	return (
		<Link search={{ ...search, tag: name }}>
			<Badge>{name}</Badge>
		</Link>
	)
}

const localBindings = {
	applyTag: { key: 'Enter' },
	confirm: { key: 'Enter', ctrl: true },
}

function toggle<T>(x: T) {
	return function (xs: T[]) {
		const index = xs.indexOf(x)
		if (index === -1) {
			// TODO: use collator
			return [...xs, x].sort()
		} else {
			return [...xs.slice(0, index), ...xs.slice(index + 1)]
		}
	}
}

function TagCheckbox({
	tag,
	checked,
	onValueChange,
}: {
	tag: string
	checked: boolean
	onValueChange: Dispatch<SetStateAction<string[]>>
}) {
	return (
		<Flex key={tag} direction="row" align="center" gap="2">
			<Checkbox
				value={tag}
				checked={checked}
				onCheckedChange={() => onValueChange(toggle(tag))}
			/>
			<label>{tag}</label>
		</Flex>
	)
}

function Content({
	id,
	init,
	close,
}: {
	id: string
	init: string[]
	close: () => void
}) {
	const allTags = useProcessedNotes((state) => state.allTags)
	const [selectedTags, setSelectedTags] = useState(init)
	const [filter, setFilter] = useState('')
	const filteredAllTags = useMemo(
		() => allTags.filter((tag) => matchQuery(tag, filter)),
		[allTags, filter],
	)
	const filteredSelectedTags = useMemo(
		() => selectedTags.filter((tag) => matchQuery(tag, filter)),
		[selectedTags, filter],
	)
	const filterTrimmed = filter.trim()
	const createDisabled =
		filterTrimmed.length === 0 ||
		selectedTags.includes(filter) ||
		allTags.includes(filter)
	const { onKeyDown, useRegister } = useHotkeyHandler(localBindings)
	const applyTag = useCallback(() => {
		const tag =
			filteredSelectedTags.at(0) || filteredAllTags.at(0) || filterTrimmed
		if (!tag) return // do not create empty tag
		setSelectedTags(toggle(tag)(selectedTags))
		setFilter('')
	}, [filteredSelectedTags, filteredAllTags, filterTrimmed, selectedTags])
	useRegister('applyTag', applyTag)
	const { mutate } = useUpsertNoteMetaValue({ tags: selectedTags })

	const confirmDisabled = dequal(init, selectedTags)
	const confirm = useCallback(() => {
		if (confirmDisabled) return
		close()
		mutate({ id, mtime: Date.now() })
	}, [close, confirmDisabled, id, mutate])
	useRegister('confirm', confirm)
	return (
		<Dialog.Content aria-describedby={undefined}>
			<Flex direction="row" justify="between" gap="1">
				<Dialog.Title>Change tags</Dialog.Title>
				<Dialog.Close>
					<Flex>
						<Cross2Icon />
						<VisuallyHidden>Close</VisuallyHidden>
					</Flex>
				</Dialog.Close>
			</Flex>
			<Flex direction="column" gap="3">
				<Flex direction="row" justify="between" align="center" gap="2">
					<TextField.Root
						placeholder="Enter tag name"
						value={filter}
						onKeyDown={onKeyDown}
						onChange={(e) => setFilter(e.target.value)}
					>
						<TextField.Slot>
							<MagnifyingGlassIcon />
						</TextField.Slot>
					</TextField.Root>
				</Flex>
				{filteredSelectedTags.map((tag) => (
					<TagCheckbox
						key={tag}
						tag={tag}
						checked={true}
						onValueChange={setSelectedTags}
					/>
				))}
				{filteredAllTags.map(
					(tag) =>
						filteredSelectedTags.includes(tag) || (
							<TagCheckbox
								key={tag}
								tag={tag}
								checked={false}
								onValueChange={setSelectedTags}
							/>
						),
				)}
				{createDisabled || (
					<Button variant="ghost" onClick={applyTag}>
						<PlusIcon />
						<Box style={{ textAlign: 'start', width: '100%' }}>
							Create <b>{filter}</b>
						</Box>
					</Button>
				)}
				<Flex direction="row" gap="2">
					<Button variant="solid" onClick={confirm} disabled={confirmDisabled}>
						Confirm
					</Button>
					<Dialog.Close>
						<Button variant="outline">Cancel</Button>
					</Dialog.Close>
				</Flex>
			</Flex>
		</Dialog.Content>
	)
}

export function TagBar({ meta }: { meta: NoteMeta }) {
	const search = useSearch({ from: '/notes' }).tag.trim() // all special values are reduced to empty string
	const tags = useNoteMeta(meta.id)?.data.tags ?? (search ? [search] : [])
	const [key, reset] = useReset()
	const [open, setOpen] = useState(false)
	const close = useCallback(() => setOpen(false), [setOpen])
	return (
		<DataList.Item>
			<DataList.Label>
				<Dialog.Root open={open} onOpenChange={setOpen}>
					<Dialog.Trigger onClick={reset}>
						<Flex justify="start" align="center" gap="2">
							Tags
							<IconButton variant="ghost">
								<Flex align="center" justify="start">
									<Tooltip content="Edit tags">
										<Box>
											<Pencil1Icon width={13} height={13} />
											<VisuallyHidden>Edit tags</VisuallyHidden>
										</Box>
									</Tooltip>
								</Flex>
							</IconButton>
						</Flex>
					</Dialog.Trigger>
					<Content key={key} id={meta.id} init={tags} close={close} />
				</Dialog.Root>
			</DataList.Label>
			<DataList.Value>
				<Flex align="center" gap="2" wrap="wrap">
					{tags.map((tag) => (
						<TagBadge key={tag} name={tag} />
					))}
				</Flex>
			</DataList.Value>
		</DataList.Item>
	)
}
