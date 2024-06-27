import { useNotesMeta } from "@/db";
import { useCreateNote } from "@/hooks/createNote";
import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/notes/edit/")({
  component: Component,
});

function Component() {
  const router = useRouter();
  const notes = useNotesMeta().data;
  const createNote = useCreateNote();
  useEffect(() => {
    if (notes.length === 0) createNote();
    else
      router.navigate({
        to: "/notes/edit/$id",
        params: { id: notes[0].id },
        search: (x) => x as any,
      });
  }, [router, notes, createNote]);
  return null;
}
