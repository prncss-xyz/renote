import {
  selectNotes,
  validateSelectNotesOpts,
} from "@/core/noteSelection";
import { useNotesMeta } from "@/db";
import { Navigate, createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Component,
  validateSearch: validateSelectNotesOpts,
});

export function Component() {
  const search = useSearch({ from: "/" });
  const notes = useNotesMeta(selectNotes(search)).data;
  const id = notes[0]?.id;
  if (id)
    return <Navigate to={"/notes/view/$id"} params={{ id }} search={search} />;
  return <Navigate to={"/notes/empty"} search={search} />;
}
