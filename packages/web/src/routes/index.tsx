import { selectNotesOptsSchema } from "@/core/noteSelection";
import { Navigate, createFileRoute, useSearch } from "@tanstack/react-router";
import { useProcessedNotes } from "./notes/-processedNotes/hooks";
import { ProcessedNotesProvider } from "./notes/-processedNotes/provider";

export const Route = createFileRoute("/")({
  component: Component,
  validateSearch: selectNotesOptsSchema,
});

function Redirect() {
  const search = useSearch({ from: "/" });
  const notes = useProcessedNotes((state) => state.notes);
  const id = notes[0]?.id;
  if (id)
    return <Navigate to={"/notes/view/$id"} params={{ id }} search={search} />;
  return <Navigate to={"/notes/empty"} search={search} />;
}

export function Component() {
  const search = useSearch({ from: Route.fullPath });
  return (
    <ProcessedNotesProvider search={search}>
      <Redirect />
    </ProcessedNotesProvider>
  );
}
