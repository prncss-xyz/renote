import { selectNotes, selectNotesOptsZero } from "@/core/noteSelection";
import { useNotesMeta } from "@/db";
import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/redirect")({
  component: Component,
});

// when simply redirecting to "/notes/ from menu, causes invariant error
export function Component() {
  const notes = useNotesMeta(selectNotes(selectNotesOptsZero)).data;
  const id = notes[0]?.id;
  if (id)
    return (
      <Navigate
        to={"/notes/edit/$id"}
        params={{ id }}
        search={selectNotesOptsZero}
      />
    );
  return <Navigate to={"/notes/create"} search={selectNotesOptsZero} />;
}
