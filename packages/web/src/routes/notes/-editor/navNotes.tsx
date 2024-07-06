import { NoteMeta } from "@/core/models";
import { selectNotes } from "@/core/noteSelection";
import { useDeleteNote, useNotesMeta } from "@/db";
import {
  TrashIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import {
  Box,
  Flex,
  IconButton,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { useSearch, Link, useLocation } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useRemove } from "./remove";

export function NavNotes({ id, deleted }: { id: string; deleted: boolean }) {
  return (
    <Flex justify="end" gap="1">
      <Edit id={id} deleted={deleted} />
      <First id={id} />
      <Previous id={id} />
      <Next id={id} />
      <Last id={id} />
      <DeleteNote id={id} deleted={deleted} />
    </Flex>
  );
}

function Edit({ id, deleted }: { id: string; deleted: boolean }) {
  const { pathname } = useLocation();
  const search = useSearch({ from: "/notes" });
  const disabled =
    pathname.startsWith("/notes/edit") || pathname.startsWith("/notes/create");
  if (deleted)
    return (
      <Tooltip content="Edit note">
        <IconButton variant="outline" disabled={true} asChild>
          <Box>
            <Pencil1Icon />
            <VisuallyHidden>Edit note</VisuallyHidden>
          </Box>
        </IconButton>
      </Tooltip>
    );
  if (disabled)
    return (
      <Tooltip content="View note">
        <IconButton variant="solid" asChild>
          <Link to="/notes/view/$id" params={{ id: id }} search={search}>
            <Pencil1Icon />
            <VisuallyHidden>View note</VisuallyHidden>
          </Link>
        </IconButton>
      </Tooltip>
    );
  return (
    <Tooltip content="Edit note">
      <IconButton variant="outline" asChild>
        <Link to="/notes/edit/$id" params={{ id: id }} search={search}>
          <Pencil1Icon />
          <VisuallyHidden>Edit</VisuallyHidden>
        </Link>
      </IconButton>
    </Tooltip>
  );
}

function DeleteNote({ id, deleted }: { id: string; deleted: boolean }) {
  const { mutate } = useDeleteNote();
  const onClick = useRemove(id, mutate);
  const { pathname } = useLocation();
  const disabled = pathname === "/notes/create";
  if (deleted)
    return (
      <IconButton variant="outline" disabled={true} asChild>
        <Box>
          <TrashIcon />
          <VisuallyHidden>Delete note</VisuallyHidden>
        </Box>
      </IconButton>
    );
  return (
    <Tooltip content="Delete note">
      <IconButton variant="outline" onClick={onClick} disabled={disabled}>
        <TrashIcon />
        <VisuallyHidden>Delete note</VisuallyHidden>
      </IconButton>
    </Tooltip>
  );
}

function useNotes() {
  const search = useSearch({ from: "/notes" });
  return useNotesMeta(selectNotes(search)).data;
}

function SelectNote({
  id,
  select,
  children,
}: {
  id: string;
  select: (notes: NoteMeta[]) => NoteMeta | undefined;
  children: ReactNode;
}) {
  const target = select(useNotes());
  const search = useSearch({ from: "/notes" });
  const disabled = !target || target?.id === id;
  if (disabled)
    return (
      <IconButton variant="outline" disabled={true}>
        {children}
      </IconButton>
    );
  return (
    <IconButton variant="outline" asChild>
      <Link to="/notes/edit/$id" params={{ id: target.id }} search={search}>
        {children}
      </Link>
    </IconButton>
  );
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
  );
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
  );
}

function previous(id: string) {
  return function (notes: NoteMeta[]) {
    let last: NoteMeta | undefined = undefined;
    for (const note of notes) {
      if (note.id === id) return last;
      last = note;
    }
    return undefined;
  };
}

function next(id: string) {
  return function (notes: NoteMeta[]) {
    let last: NoteMeta | undefined = undefined;
    for (let i = notes.length - 1; i >= 0; i--) {
      const note = notes[i];
      if (note.id === id) return last;
      last = note;
    }
    return undefined;
  };
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
  );
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
  );
}
