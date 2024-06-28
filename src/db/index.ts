import { NoteMeta, noteZero } from "@/core/models";
import {
  QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { openDB } from "idb";

const dbPromise = openDB("notes", 1, {
  upgrade(db) {
    db.createObjectStore("contents");
    db.createObjectStore("metadata", { keyPath: "id" });
  },
});

async function getNotesMeta(): Promise<NoteMeta[]> {
  const db = await dbPromise;
  return await db.getAll("metadata");
}

const getNotesOpts = queryOptions({
  queryKey: ["notes", "metadata"],
  queryFn: getNotesMeta,
});

export function prefetchNotesMeta(queryClient: QueryClient) {
  return queryClient.prefetchQuery(getNotesOpts);
}

export function useNotesMeta(
  select?: ((data: NoteMeta[]) => NoteMeta[]) | undefined,
) {
  return useSuspenseQuery({
    ...getNotesOpts,
    select,
  });
}

async function clearDbNotes() {
  const db = await dbPromise;
  const tx = db.transaction(["metadata", "contents"], "readwrite");
  tx.objectStore("metadata").clear();
  tx.objectStore("contents").clear();
  await tx.done;
}

export function useClearNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearDbNotes,
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["notes", "metadata"] }),
        queryClient.cancelQueries({ queryKey: ["notes", "contents"] }),
      ]);
      queryClient.setQueryData(["notes", "metadata"], []);
    },
  });
}

async function upsertDbNote(meta: NoteMeta, contents: string) {
  const db = await dbPromise;
  const tx = db.transaction(["metadata", "contents"], "readwrite");
  tx.objectStore("metadata").put(meta);
  tx.objectStore("contents").put(contents, meta.id);
  await tx.done;
}

function upsertCacheMeta(arr: NoteMeta[], meta: NoteMeta) {
  const index = arr.findIndex((m) => m.id === meta.id);
  if (index === -1) {
    return [...arr, meta];
  }
  return arr.with(index, meta);
}

export function useUpsertNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meta, contents }: { meta: NoteMeta; contents: string }) =>
      upsertDbNote(meta, contents),
    onMutate: async ({ meta, contents }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["notes", "metadata"] }),
        queryClient.cancelQueries({ queryKey: ["notes", "contents", meta.id] }),
      ]);
      queryClient.setQueryData(["notes", "metadata"], (old: NoteMeta[]) =>
        upsertCacheMeta(old, meta),
      );
      queryClient.setQueryData(["notes", "contents", meta.id], contents);
    },
  });
}

async function getNoteContents(id: string): Promise<string> {
  const db = await dbPromise;
  return (await db.get("contents", id)) || "";
}

function getNoteContentsOpts(id: string) {
  return queryOptions({
    queryKey: ["notes", "contents", id],
    queryFn: () => getNoteContents(id),
  });
}

export function prefetchNoteContents(queryClient: QueryClient, id: string) {
  return queryClient.prefetchQuery(getNoteContentsOpts(id));
}

export function useNoteContents(id: string) {
  return useSuspenseQuery(getNoteContentsOpts(id));
}

async function deleteNote(id: string, now: number) {
  const db = await dbPromise;
  await db.put("metadata", { ...noteZero, id, mtime: now });
  await db.delete("contents", id);
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id, Date.now()),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["notes", "metadata"] }),
        queryClient.cancelQueries({ queryKey: ["notes", "contents", id] }),
      ]);
      queryClient.setQueryData(["notes", "metadata"], (old: NoteMeta[]) =>
        upsertCacheMeta(old, { ...noteZero, id, mtime: Date.now() }),
      );
    },
  });
}
