import { selectNotes } from "@/core/noteSelection";
import { useNotesMeta } from "@/db";
import { useCreateNote } from "@/hooks/createNote";
import {
  createFileRoute,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/notes/edit/")({
  component: Component,
});

function Component() {
  const router = useRouter();
  const search = useSearch({ from: "/notes" });
  const notes = useNotesMeta(selectNotes(search)).data;
  const id = notes[0]?.id;
  const createNote = useCreateNote();
  useEffect(() => {
    if (!id) createNote();
    else
      router.navigate({
        to: "/notes/edit/$id",
        params: { id },
        search: (x) => x as any,
      });
  }, [router, notes, createNote]);
  return null;
}
