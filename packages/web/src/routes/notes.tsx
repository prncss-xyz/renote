import { ensureNotesMeta } from "@/db";
import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useNotesMeta } from "@/db";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  Flex,
  IconButton,
  Select,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { Link, useSearch } from "@tanstack/react-router";
import {
  SortByOpts,
  expendNotes,
  selectNotes,
  sortByNames,
  validateSelectNotesOpts,
} from "@/core/noteSelection";
import "./notes.css";
import { NoteMeta } from "@/core/models";
import { Fuzzy } from "./-fuzzy";

export const Route = createFileRoute("/notes")({
  component: Component,
  loader: ({ context: { queryClient } }) => ensureNotesMeta(queryClient),
  validateSearch: validateSelectNotesOpts,
});

export function Component() {
  return (
    <Flex direction="row" gap="3" flexGrow="1">
      <Flex direction="column" width="250px" gap="2">
        <Flex direction="row" gap="1">
          <Fuzzy />
          <Trash />
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

function Trash() {
  const search = useSearch({ from: Route.fullPath });
  const notesMeta = useNotesMeta().data;
  // FIX: this value is not reactive
  const { trash } = expendNotes(search)(notesMeta);
  if (search.trash) {
    return (
      <Tooltip content="Leave trash bin">
        <IconButton variant="solid" asChild>
          <Link to="/" search={{ ...search, trash: false }}>
            <TrashIcon />
            <VisuallyHidden>Leave trash bin</VisuallyHidden>
          </Link>
        </IconButton>
      </Tooltip>
    );
  }
  return (
    <Tooltip content="Visit trash bin">
      <IconButton variant="outline" disabled={!trash} asChild>
        <Link to="/" search={{ ...search, trash: true }}>
          <TrashIcon />
          <VisuallyHidden>Visit trash bin</VisuallyHidden>
        </Link>
      </IconButton>
    </Tooltip>
  );
}

function CreateNote() {
  const { pathname } = useLocation();
  const search = useSearch({ from: Route.fullPath });
  const disabled = pathname === "/notes/create";
  return (
    <Tooltip content="Create note">
      <IconButton disabled={disabled} asChild>
        <Link to="/notes/create" search={search}>
          <PlusIcon />
          <VisuallyHidden>Create note</VisuallyHidden>
        </Link>
      </IconButton>
    </Tooltip>
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
  const notes = useNotesMeta(selectNotes(search)).data;
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
