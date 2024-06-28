import { prefetchNotesMeta } from "@/db";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useNotesMeta } from "@/db";
import { useCreateNote } from "@/hooks/createNote";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from "@radix-ui/react-icons";
import { Button, Flex, Heading, IconButton, Select } from "@radix-ui/themes";
import { Link, useSearch } from "@tanstack/react-router";
import {
  SelectNotesOpts,
  SortByOpts,
  normalizeSortBy,
  selectNotes,
  sortByNames,
} from "@/core/noteSelection";

export const Route = createFileRoute("/notes")({
  component: Component,
  loader: ({ context: { queryClient } }) => prefetchNotesMeta(queryClient),
  validateSearch: (search: Record<string, unknown>): SelectNotesOpts => ({
    desc: Boolean(search.desc),
    sortBy: normalizeSortBy(search.sortBy),
  }),
});

export function Component() {
  return (
    <Flex direction="column" gap="4">
      <Flex width="100%" gap="3">
        <Flex width="300px" direction="column" gap="2">
          <CreateNote />
          <Heading as="h2">Notes</Heading>
          <Flex gap="1" justify="between">
            <SortBy />
            <Dir />
          </Flex>
          <NoteList />
          <ClearAll />
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
      </Select.Content>
    </Select.Root>
  );
}

function Dir() {
  const search = useSearch({ from: Route.fullPath });
  const { desc } = search;
  if (desc)
    return (
      <Link search={{ ...search, desc: false }}>
        <ArrowDownIcon />
      </Link>
    );
  return (
    <Link search={{ ...search, desc: true }}>
      <ArrowUpIcon />
    </Link>
  );
}

function CreateNote() {
  const createNote = useCreateNote();
  return (
    <IconButton onClick={createNote}>
      <PlusIcon />
    </IconButton>
  );
}

function ClearAll() {
  return <Button>Clear all</Button>;
}

function NoteList() {
  const search = useSearch({ from: Route.fullPath });
  const notes = useNotesMeta(selectNotes(search)).data;
  return notes.map((note) => (
    <Link
      key={note.id}
      from={Route.fullPath}
      to="/notes/edit/$id"
      params={{
        id: note.id,
      }}
      search={search}
    >
      {note.title || <em>{note.id}</em>}
    </Link>
  ));
}
