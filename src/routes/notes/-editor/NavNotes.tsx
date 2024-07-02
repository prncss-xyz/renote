import { NoteMeta } from "@/core/models";
import { selectNotes, findNext } from "@/core/noteSelection";
import { useDeleteNote, useNotesMeta } from "@/db";
import {
  TrashIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import { Flex, IconButton, VisuallyHidden } from "@radix-ui/themes";
import {
  useRouter,
  useSearch,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { useRef, useCallback, useEffect, ReactNode } from "react";

export function NavNotes({ id }: { id: string }) {
  return (
    <Flex justify="end" gap="1">
      <First id={id} />
      <Previous id={id} />
      <Next id={id} />
      <Last id={id} />
      <DeleteNote id={id} />
    </Flex>
  );
}

function DeleteNote({ id }: { id: string }) {
  const onClick = useDelete(id);
  const { pathname } = useLocation();
  const disabled = pathname === "/notes/create";
  return (
    <IconButton variant="outline" onClick={onClick} disabled={disabled}>
      <TrashIcon />
      <VisuallyHidden>Delete note</VisuallyHidden>
    </IconButton>
  );
}

// TODO: we need a global state to make note disappear from noteList before deletion

// When we want to delete a note, we must first unmount the note's route
// in order to avoid a "note has been deleted" message
function useDelete(id: string) {
  const { mutate: deleteNote } = useDeleteNote();
  const shouldDelete = useRef(false);
  const { navigate } = useRouter();
  const search = useSearch({ strict: false });
  const notes = useNotesMeta(selectNotes(search as any)).data;
  const onClick = useCallback(() => {
    const id_ = findNext(notes, id);
    if (id_)
      navigate({
        to: "/notes/edit/$id",
        params: { id: id_ },
        search: (x: any) => x,
      });
    else
      navigate({
        to: "/notes/create",
        search: (x: any) => x,
      });
    shouldDelete.current = true;
  }, [navigate, id, notes]);
  useEffect(() => {
    return () => {
      if (!shouldDelete.current) return;
      deleteNote(id);
    };
  }, [shouldDelete, id]);
  return onClick;
}

function useNotes() {
  const search = useSearch({ strict: false }) as any;
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
  const disabled = !target || target?.id === id;
  if (disabled)
    return (
      <IconButton variant="outline" disabled={true}>
        {children}
      </IconButton>
    );
  return (
    <IconButton variant="outline" asChild>
      <Link
        to="/notes/edit/$id"
        params={{ id: target.id }}
        search={(x: any) => x}
      >
        {children}
      </Link>
    </IconButton>
  );
}

function First({ id }: { id: string }) {
  return (
    <>
      <SelectNote id={id} select={(notes) => notes.at(0)}>
        {<DoubleArrowLeftIcon />}
      </SelectNote>
      <VisuallyHidden>First note</VisuallyHidden>
    </>
  );
}

function Last({ id }: { id: string }) {
  return (
    <>
      <SelectNote id={id} select={(notes) => notes.at(-1)}>
        {<DoubleArrowRightIcon />}
      </SelectNote>
      <VisuallyHidden>Last note</VisuallyHidden>
    </>
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
    <>
      <SelectNote id={id} select={previous(id)}>
        {<ArrowLeftIcon />}
      </SelectNote>
      <VisuallyHidden>Previous note</VisuallyHidden>
    </>
  );
}

function Next({ id }: { id: string }) {
  return (
    <>
      <SelectNote id={id} select={next(id)}>
        {<ArrowRightIcon />}
      </SelectNote>
      <VisuallyHidden>Next note</VisuallyHidden>
    </>
  );
}
