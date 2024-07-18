import { ensureNotesMeta } from "@/db";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Box, Flex } from "@radix-ui/themes";
import { useSearch } from "@tanstack/react-router";
import { selectNotesOptsSchema } from "@/core/noteSelection";
import "./notes.css";
import { ProcessedNotesProvider } from "./notes/-processedNotes/provider";
import { NotesSelector } from "./notes/-notesSelector";

export const Route = createFileRoute("/notes")({
  component: Component,
  loader: ({ context: { queryClient } }) => ensureNotesMeta(queryClient),
  validateSearch: selectNotesOptsSchema,
});

export function Component() {
  const search = useSearch({ from: Route.fullPath });
  return (
    <ProcessedNotesProvider search={search}>
      <Flex gap="3" flexGrow="1">
        <Box display={{ initial: "none", sm: "block" }}>
          <NotesSelector />
        </Box>
        <Flex flexGrow="1">
          <Outlet />
        </Flex>
      </Flex>
    </ProcessedNotesProvider>
  );
}
