import { selectNotes } from "@/core/noteSelection";
import { useNotesMeta } from "@/db";
import { Navigate, createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/notes/")({
  component: Component,
});

/*
function useRedirect() {
  const search = useSearch({ from: "/notes/" });
  const notes = useNotesMeta(selectNotes(search)).data;
  const id = notes[0]?.id;
  const { navigate } = useRouter();
  useEffect(() => {
    if (id)
      navigate({
        to: "/notes/edit/$id",
        params: { id },
        search: selectNotesOptsZero,
      });
    else
      navigate({
        to: "/notes/create",
        search: selectNotesOptsZero,
      });
  }, [navigate, id]);
}

export function Component() {
  useRedirect();
  return null;
}
*/

export function Component() {
  const search = useSearch({ from: Route.fullPath });
  const notes = useNotesMeta(selectNotes(search)).data;
  const id = notes[0]?.id;
  if (id)
    return <Navigate to={"/notes/edit/$id"} params={{ id }} search={search} />;
  return <Navigate to={"/notes/create"} search={search} />;
}
