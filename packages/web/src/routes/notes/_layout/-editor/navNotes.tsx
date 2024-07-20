import { NoteMeta } from '@/core/models'
import { useArchiveNote, useDeleteNote } from '@/db'
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BackpackIcon,
	Cross2Icon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
	HamburgerMenuIcon,
	Pencil1Icon,
	TrashIcon,
} from '@radix-ui/react-icons'
import {
	Box,
	Dialog,
	Flex,
	IconButton,
	Tooltip,
	VisuallyHidden,
} from '@radix-ui/themes'
import { Link, useLocation, useSearch } from '@tanstack/react-router'
import { ReactNode } from 'react'

import { NotesSelector } from '../-notesSelector'
import { useProcessedNotes } from '../-processedNotes/hooks'
import { useRemove } from './remove'

const from = '/notes/_layout'

export function NavNotes({
	id,
	deleted,
	archived,
}: {
	id: string
	deleted: boolean
	archived: boolean
}) {
	return (
		<Flex justify="between" gap="1" flexGrow="1">
			<Menu />
			<Flex justify="end" gap="1" flexGrow="1">
				<Edit id={id} deleted={deleted} />
				<First id={id} />
				<Previous id={id} />
				<Next id={id} />
				<Last id={id} />
				{import.meta.env.DEV && <ToggleArchive id={id} archived={archived} />}
				<DeleteNote id={id} deleted={deleted} />
			</Flex>
		</Flex>
	)
}

function Menu() {
	return (
		<Box display={{ initial: 'block', sm: 'none' }}>
			<Dialog.Root>
				<Dialog.Trigger>
					<IconButton variant="outline">
						<Tooltip content="Notes selection">
							<Box>
								<HamburgerMenuIcon />
								<VisuallyHidden>Notes selection</VisuallyHidden>
							</Box>
						</Tooltip>
					</IconButton>
				</Dialog.Trigger>
				<Dialog.Content aria-describedby={undefined}>
					<Flex direction="row" justify="between" gap="1">
						<Dialog.Title>Notes selection</Dialog.Title>
						<Dialog.Close>
							<Flex>
								<Cross2Icon />
								<VisuallyHidden>Close</VisuallyHidden>
							</Flex>
						</Dialog.Close>
					</Flex>
					<NotesSelector />
				</Dialog.Content>
			</Dialog.Root>
		</Box>
	)
}

function Edit({ id, deleted }: { id: string; deleted: boolean }) {
	const { pathname } = useLocation()
	const search = useSearch({ from })
	const disabled =
		pathname.startsWith('/notes/edit') || pathname.startsWith('/notes/create')
	if (deleted)
		return (
			<IconButton variant="outline" disabled={true} asChild>
				<Tooltip content="Edit note">
					<Box>
						<Pencil1Icon />
						<VisuallyHidden>Edit note</VisuallyHidden>
					</Box>
				</Tooltip>
			</IconButton>
		)
	if (disabled)
		return (
			<IconButton variant="solid" asChild>
				<Link to="/notes/edit/$id" params={{ id }} search={search}>
					<Tooltip content="View note">
						<Box>
							<Pencil1Icon />
							<VisuallyHidden>View note</VisuallyHidden>
						</Box>
					</Tooltip>
				</Link>
			</IconButton>
		)
	return (
		<IconButton variant="outline" asChild>
			<Link to="/notes/edit/$id" params={{ id: id }} search={search}>
				<Tooltip content="Edit note">
					<Box>
						<Pencil1Icon />
						<VisuallyHidden>Edit</VisuallyHidden>
					</Box>
				</Tooltip>
			</Link>
		</IconButton>
	)
}

// TODO: make reactive
function ToggleArchive({ id, archived }: { id: string; archived: boolean }) {
	const { mutate } = useArchiveNote(!archived)
	const onClick = () => mutate({ id, mtime: Date.now() })
	const { pathname } = useLocation()
	const disabled = pathname === '/notes/create'
	if (archived)
		return (
			<IconButton variant="solid" onClick={onClick} disabled={disabled}>
				<Tooltip content="Archive note">
					<Box>
						<BackpackIcon />
						<VisuallyHidden>Archive note</VisuallyHidden>
					</Box>
				</Tooltip>
			</IconButton>
		)
	return (
		<IconButton variant="outline" onClick={onClick} disabled={disabled}>
			<Tooltip content="Archive note">
				<Box>
					<BackpackIcon />
					<VisuallyHidden>Archive note</VisuallyHidden>
				</Box>
			</Tooltip>
		</IconButton>
	)
}

function DeleteNote({ id, deleted }: { id: string; deleted: boolean }) {
	const { mutate } = useDeleteNote()
	const onClick = useRemove(id, mutate)
	const { pathname } = useLocation()
	const disabled = pathname === '/notes/create'
	if (deleted)
		return (
			<IconButton variant="outline" disabled={true} asChild>
				<Tooltip content="Delete note">
					<Box>
						<TrashIcon />
						<VisuallyHidden>Delete note</VisuallyHidden>
					</Box>
				</Tooltip>
			</IconButton>
		)
	return (
		<IconButton variant="outline" onClick={onClick} disabled={disabled}>
			<Tooltip content="Delete note">
				<Box>
					<TrashIcon />
					<VisuallyHidden>Delete note</VisuallyHidden>
				</Box>
			</Tooltip>
		</IconButton>
	)
}

function SelectNote({
	id,
	select,
	children,
}: {
	id: string
	select: (notes: NoteMeta[]) => NoteMeta | undefined
	children: ReactNode
}) {
	const target = useProcessedNotes((state) => select(state.notes))
	const search = useSearch({ from })
	const disabled = !target || target?.id === id
	if (disabled)
		return (
			<IconButton variant="outline" disabled={true}>
				{children}
			</IconButton>
		)
	return (
		<IconButton variant="outline" asChild>
			<Link to="/notes/view/$id" params={{ id: target.id }} search={search}>
				{children}
			</Link>
		</IconButton>
	)
}

function First({ id }: { id: string }) {
	return (
		<Tooltip content="First note">
			<Box>
				<SelectNote id={id} select={(notes) => notes.at(0)}>
					{<DoubleArrowLeftIcon />}
				</SelectNote>
				<VisuallyHidden>First note</VisuallyHidden>
			</Box>
		</Tooltip>
	)
}

function Last({ id }: { id: string }) {
	return (
		<Tooltip content="Last note">
			<Box>
				<SelectNote id={id} select={(notes) => notes.at(-1)}>
					{<DoubleArrowRightIcon />}
				</SelectNote>
				<VisuallyHidden>Last note</VisuallyHidden>
			</Box>
		</Tooltip>
	)
}

function previous(id: string) {
	return function (notes: NoteMeta[]) {
		let last: NoteMeta | undefined = undefined
		for (const note of notes) {
			if (note.id === id) return last
			last = note
		}
		return undefined
	}
}

function next(id: string) {
	return function (notes: NoteMeta[]) {
		let last: NoteMeta | undefined = undefined
		for (let i = notes.length - 1; i >= 0; i--) {
			const note = notes[i]
			if (note.id === id) return last
			last = note
		}
		return undefined
	}
}

function Previous({ id }: { id: string }) {
	return (
		<Tooltip content="Previous note">
			<Box>
				<SelectNote id={id} select={previous(id)}>
					{<ArrowLeftIcon />}
				</SelectNote>
				<VisuallyHidden>Previous note</VisuallyHidden>
			</Box>
		</Tooltip>
	)
}

function Next({ id }: { id: string }) {
	return (
		<Tooltip content="Next note">
			<Box>
				<SelectNote id={id} select={next(id)}>
					{<ArrowRightIcon />}
				</SelectNote>
				<VisuallyHidden>Next note</VisuallyHidden>
			</Box>
		</Tooltip>
	)
}
