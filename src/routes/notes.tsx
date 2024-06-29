import { prefetchNotesMeta } from "@/db";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useNotesMeta } from "@/db";
import { useCreateNote } from "@/hooks/createNote";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  Box,
  Flex,
  IconButton,
  Select,
  VisuallyHidden,
} from "@radix-ui/themes";
import { Link, useSearch } from "@tanstack/react-router";
import {
  SortByOpts,
  selectNotes,
  sortByNames,
  validateSelectNotesOpts,
} from "@/core/noteSelection";
import "./notes.css";

export const Route = createFileRoute("/notes")({
  component: Component,
  loader: ({ context: { queryClient } }) => prefetchNotesMeta(queryClient),
  validateSearch: validateSelectNotesOpts,
});

export function Component() {
  return (
    <Flex direction="column" gap="4">
      <Flex width="100%" gap="3">
        <Flex width="300px" direction="column" gap="2">
          <CreateNote />
          <Flex gap="1" justify="between" align="center" className="note-dir">
            <SortBy />
            <Dir />
          </Flex>
          <NoteList />
        </Flex>
        <Flex direction="column" width="100%">
          <Flex direction="column" width="100%">
            <Outlet />
          </Flex>
        </Flex>
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
      </Select.Content>{" "}
    </Select.Root>
  );
}

function Dir() {
  const search = useSearch({ from: Route.fullPath });
  const { asc } = search;
  // visually hidden describes the effect of the link, not the actual state
  if (asc)
    return (
      <Link search={{ ...search, asc: false }}>
        <ArrowUpIcon />
        <VisuallyHidden>Sort by ascending</VisuallyHidden>
      </Link>
    );
  return (
    <Link search={{ ...search, asc: true }}>
      <ArrowDownIcon />
      <VisuallyHidden>Sort by descending</VisuallyHidden>
    </Link>
  );
}

function CreateNote() {
  const createNote = useCreateNote();
  return (
    <IconButton onClick={createNote}>
      <PlusIcon />
      <VisuallyHidden>Create new note</VisuallyHidden>
    </IconButton>
  );
}

function NoteList() {
  const search = useSearch({ from: Route.fullPath });
  const notes = useNotesMeta(selectNotes(search)).data;
  return (
    <Flex direction="column" className="note-list">
      {notes.map((note) => (
        <Link
          key={note.id}
          from={Route.fullPath}
          to="/notes/edit/$id"
          params={{
            id: note.id,
          }}
          search={search}
        >
          <Box px="2">{note.title || <em>untitled</em>}</Box>
        </Link>
      ))}
    </Flex>
  );
}
