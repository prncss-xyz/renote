import { ensureNotesMeta } from "@/db";
import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Flex,
  IconButton,
  Select,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { Link, useSearch } from "@tanstack/react-router";
import {
  SortByOpts,
  selectNotesOptsSchema,
  sortByNames,
} from "@/core/noteSelection";
import "./notes.css";
import { NoteMeta } from "@/core/models";
import { Fuzzy } from "./-fuzzy";
import { ProcessedNotesProvider } from "./notes/-processedNotes/provider";
import { useProcessedNotes } from "./notes/-processedNotes/hooks";

export const Route = createFileRoute("/notes")({
  component: Component,
  loader: ({ context: { queryClient } }) => ensureNotesMeta(queryClient),
  validateSearch: selectNotesOptsSchema,
});

export function Component() {
  const search = useSearch({ from: Route.fullPath });
  return (
    <ProcessedNotesProvider search={search}>
      <Flex direction="row" gap="3" flexGrow="1">
        <Flex direction="column" width="250px" gap="2">
          <Flex direction="row" gap="1">
            <Fuzzy />
            <VisitTrash />
            <CreateNote />
          </Flex>
          <Flex direction="row" gap="1" justify="between" align="center">
            <SortBy />
            <Dir />
          </Flex>
          <Flex direction="column" flexGrow="1">
            <NotesList />
          </Flex>
        </Flex>
        <Flex direction="column" flexGrow="1">
          <Outlet />
        </Flex>
      </Flex>
    </ProcessedNotesProvider>
  );
}

function SortBy() {
  const search = useSearch({ from: Route.fullPath });
  const navigate = useNavigate();
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
  );
}

function Dir() {
  const search = useSearch({ from: Route.fullPath });
  const { asc } = search;
  // visually hidden describes the effect of the link, not the actual state
  if (asc)
    return (
      <Link className="notes__dir__link" search={{ ...search, asc: false }}>
        <ArrowUpIcon />
        <VisuallyHidden>Sort by ascending</VisuallyHidden>
      </Link>
    );
  return (
    <Link className="notes__dir__link" search={{ ...search, asc: true }}>
      <ArrowDownIcon />
      <VisuallyHidden>Sort by descending</VisuallyHidden>
    </Link>
  );
}

function VisitTrash() {
  const search = useSearch({ from: Route.fullPath });
  // FIX: this value is not reactive
  const trash = useProcessedNotes(({ expend }) => expend.trash);
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
    );
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
  );
}

function CreateNote() {
  const { pathname } = useLocation();
  const search = useSearch({ from: Route.fullPath });
  const disabled = pathname === "/notes/create";
  return (
    <IconButton disabled={disabled} asChild>
      <Link to="/notes/create" search={search}>
        <Tooltip content="Create note">
          <Box>
            <PlusIcon />
            <VisuallyHidden>Create note</VisuallyHidden>
          </Box>
        </Tooltip>
      </Link>
    </IconButton>
  );
}

function toDate(btime: number, time: boolean) {
  let yourDate = new Date(btime);
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  const [d, rest] = yourDate.toISOString().split("T");
  if (!time) return d;
  const [h, m] = rest.split(":");
  return `${d} ${h}:${m}`;
}

function NoteWithTitle({ title }: { title: string }) {
  return (
    <Flex px="2" justify="start">
      {title}
    </Flex>
  );
}

function NoteWithDate({ date }: { date: number }) {
  return (
    <Flex px="2" justify="start" style={{ fontStyle: "italic" }}>
      {toDate(date, true)}
    </Flex>
  );
}

function Note({ note }: { note: NoteMeta }) {
  return note.title ? (
    <NoteWithTitle title={note.title} />
  ) : (
    <NoteWithDate date={note.btime} />
  );
}

function NotesList() {
  const search = useSearch({ from: Route.fullPath });
  const notes = useProcessedNotes(({ notes }) => notes);
  return (
    <Flex flexGrow="1" direction="column" overflowY="auto">
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
    </Flex>
  );
}
