import { NoteMeta } from '@/core/models'
import { sortByNames, SortByOpts } from '@/core/noteSelection'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	BackpackIcon,
	PlusIcon,
	TrashIcon,
} from '@radix-ui/react-icons'
import {
	Box,
	Flex,
	IconButton,
	ScrollArea,
	Select,
	Tooltip,
	VisuallyHidden,
} from '@radix-ui/themes'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'

import { Fuzzy } from '../-fuzzy'
import { Selector } from '../-selector'
import { Route } from '../notes'
import { useProcessedNotes } from './-processedNotes/hooks'

export function NotesSelector() {
	return (
		<Flex
			direction="column"
			width={{ sm: '250px' }}
			gap="2"
			height={{
				initial: 'calc(100vh - 170px)',
				sm: '100%',
			}}
		>
			<Flex direction="row" gap="1">
				<Fuzzy />
				{import.meta.env.DEV && <IncludeArchived />}
				<VisitTrash />
				<CreateNote />
			</Flex>
			<Selector />
			<Flex direction="row" gap="1" justify="between" align="center">
				<SortBy />
				<Dir />
			</Flex>
			<ScrollArea type="auto" scrollbars="vertical">
				<NotesList />
			</ScrollArea>
		</Flex>
	)
}

function SortBy() {
	const search = useSearch({ from: Route.fullPath })
	const navigate = useNavigate()
	return (
		<Select.Root
			defaultValue={search.sortBy}
			onValueChange={(value) =>
				navigate({
					search: { ...search, sortBy: value as SortByOpts },
				})
			}
		>
			<Select.Trigger />
			<Select.Content>
				{Object.entries(sortByNames).map(([key, value]) => (
					<Select.Item key={key} value={key}>
						{value}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

function Dir() {
	const search = useSearch({ from: Route.fullPath })
	const { asc } = search
	// visually hidden describes the effect of the link, not the actual state
	if (asc)
		return (
			<Link className="notes__dir__link" search={{ ...search, asc: false }}>
				<ArrowDownIcon />
				<VisuallyHidden>Sort by descending</VisuallyHidden>
			</Link>
		)
	return (
		<Link className="notes__dir__link" search={{ ...search, asc: true }}>
			<ArrowUpIcon />
			<VisuallyHidden>Sort by ascending</VisuallyHidden>
		</Link>
	)
}

function IncludeArchived() {
	const search = useSearch({ from: Route.fullPath })
	const archive = useProcessedNotes(({ expend }) => expend.archive)
	if (search.archive) {
		return (
			<IconButton variant="solid" asChild>
				<Link to="/" search={{ ...search, archive: false }}>
					<Tooltip content="Exclude archived notes">
						<Box>
							<BackpackIcon />
							<VisuallyHidden>Exclude archived notes</VisuallyHidden>
						</Box>
					</Tooltip>
				</Link>
			</IconButton>
		)
	}
	return (
		<IconButton variant="outline" disabled={!archive} asChild>
			<Link to="/" search={{ ...search, archive: true }}>
				<Tooltip content="Include archived notes">
					<Box>
						<BackpackIcon />
						<VisuallyHidden>Include archived notes</VisuallyHidden>
					</Box>
				</Tooltip>
			</Link>
		</IconButton>
	)
}

function VisitTrash() {
	const search = useSearch({ from: Route.fullPath })
	// FIX: this value is not reactive
	const trash = useProcessedNotes(({ expend }) => expend.trash)
	if (search.trash) {
		return (
			<IconButton variant="solid" asChild>
				<Link to="/" search={{ ...search, trash: false }}>
					<Tooltip content="Leave trash bin">
						<Box>
							<TrashIcon />
							<VisuallyHidden>Leave trash bin</VisuallyHidden>
						</Box>
					</Tooltip>
				</Link>
			</IconButton>
		)
	}
	return (
		<IconButton variant="outline" disabled={!trash} asChild>
			<Link to="/" search={{ ...search, trash: true }}>
				<Tooltip content="Visit trash bin">
					<Box>
						<TrashIcon />
						<VisuallyHidden>Visit trash bin</VisuallyHidden>
					</Box>
				</Tooltip>
			</Link>
		</IconButton>
	)
}

function CreateNote() {
	const search = useSearch({ from: Route.fullPath })
	return (
		<IconButton variant="outline" asChild>
			<Link to="/notes/create" search={search}>
				<Tooltip content="Create note">
					<Box>
						<PlusIcon />
						<VisuallyHidden>Create note</VisuallyHidden>
					</Box>
				</Tooltip>
			</Link>
		</IconButton>
	)
}

function NotesList() {
	const search = useSearch({ from: Route.fullPath })
	const notes = useProcessedNotes(({ notes }) => notes)
	return (
		<>
			{notes.map((note) => (
				<Link
					key={note.id}
					from={Route.fullPath}
					to="/notes/view/$id"
					params={{
						id: note.id,
					}}
					search={search}
					className="notes__list__link"
				>
					<Note note={note} />
				</Link>
			))}
		</>
	)
}

function Note({ note }: { note: NoteMeta }) {
	return note.title ? (
		<NoteWithTitle title={note.title} />
	) : (
		<NoteWithDate date={note.btime} />
	)
}

function toDate(btime: number, time: boolean) {
	let yourDate = new Date(btime)
	const offset = yourDate.getTimezoneOffset()
	yourDate = new Date(yourDate.getTime() - offset * 60 * 1000)
	const [d, rest] = yourDate.toISOString().split('T')
	if (!time) return d
	const [h, m] = rest.split(':')
	return `${d} ${h}:${m}`
}

function NoteWithTitle({ title }: { title: string }) {
	return (
		<Flex px="2" justify="start">
			{title}
		</Flex>
	)
}

function NoteWithDate({ date }: { date: number }) {
	return (
		<Flex px="2" justify="start" style={{ fontStyle: 'italic' }}>
			{toDate(date, true)}
		</Flex>
	)
}
