import { createFileRoute } from "@tanstack/react-router";
import {
  ensureNoteContents,
  ensureNotesMeta,
  useNoteContents,
  useNoteMeta,
} from "@/db/index";
import { Box } from "@radix-ui/themes";
import { useState } from "react";
import { Editor } from "../-editor";

export const Route = createFileRoute("/notes/edit/$id")({
  component: Component,
  loader: ({ params: { id }, context: { queryClient } }) =>
    Promise.all([
      ensureNotesMeta(queryClient),
      ensureNoteContents(queryClient, id),
    ]),
});

export function Component() {
  const { id } = Route.useParams();
  return <Note key={id} id={id} />;
}

export function Note({ id }: { id: string }) {
  // when using a loader insteat of hooks, loader doesn't run on redirect, unless nativage is wrapped
  // in a timout; also prevents from using links

  // this is useful to prevent rerendering when data change is caused by an external event
  // which is currently not hapenning
  const [meta] = useState(useNoteMeta(id).data);
  const [contents] = useState(useNoteContents(id).data);
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
