import { selectNotes, selectNotesOptsZero } from "@/core/noteSelection";
import { useNotesMeta } from "@/db";
import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Component,
});

export function Component() {
  const search = selectNotesOptsZero;
  const notes = useNotesMeta(selectNotes(search)).data;
  const id = notes[0]?.id;
  if (id)
    return <Navigate to={"/notes/edit/$id"} params={{ id }} search={search} />;
  return <Navigate to={"/notes/empty"} search={search} />;
}
