import { createFileRoute } from "@tanstack/react-router";
import {
  prefetchNoteContents,
  useNoteContents,
  useNotesMeta,
} from "@/db/index";
import { Box } from "@radix-ui/themes";
import { Editor } from "../-editor";

export const Route = createFileRoute("/notes/edit/$id")({
  component: Component,
  loader: ({ context: { queryClient }, params: { id } }) =>
    prefetchNoteContents(queryClient, id),
});

function Component() {
  const { id } = Route.useParams();
  const notes = useNotesMeta().data;
  const contents = useNoteContents(id).data;
  const meta = notes.find((note) => note.id === id);
  if (!meta) return <NotFound currentId={id} />;
  if (!meta.btime) return <Deleted currentId={id} />;
  return <Editor meta={meta} contents={contents} />;
}

function Deleted({ currentId }: { currentId: string }) {
  return (
    <Box>
      The note with id <code>{currentId}</code> has been deleted.
    </Box>
  );
}

function NotFound({ currentId }: { currentId: string }) {
  return (
    <Box>
      The note with id <code>{currentId}</code> was not found.
    </Box>
  );
}
