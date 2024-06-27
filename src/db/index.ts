import { NoteMeta, noteZero } from "@/core/models";
import {
  QueryClient,
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
  return await dbPromise.then((db) => db.getAll("metadata"));
}

export function prefetchNotesMeta(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ["notes", "metadata"],
    queryFn: getNotesMeta,
  });
}

export function useNotesMeta(
  select?: ((data: NoteMeta[]) => NoteMeta[]) | undefined,
) {
  return useSuspenseQuery({
    queryKey: ["notes", "metadata"],
    queryFn: getNotesMeta,
    select,
  });
}

async function upsertDbNote(meta: NoteMeta, contents: string) {
  // TODO: transaction
  return await Promise.all([
    dbPromise.then((db) => db.put("metadata", meta)),
    dbPromise.then((db) => db.put("contents", contents, meta.id)),
  ]);
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
      await queryClient.cancelQueries({ queryKey: ["notes", "metadata"] });
      queryClient.setQueryData(["notes", "metadata"], (old: NoteMeta[]) =>
        upsertCacheMeta(old, meta),
      );
      await queryClient.cancelQueries({ queryKey: ["notes", "contents"] });
      queryClient.setQueryData(["notes", "contents"], () => contents);
    },
  });
}

async function getNoteContents(id: string): Promise<string> {
  return (await dbPromise.then((db) => db.get("contents", id))) || "";
}

export function prefetchNoteContents(queryClient: QueryClient, id: string) {
  return queryClient.prefetchQuery({
    queryKey: ["notes", "contents", id],
    queryFn: () => getNoteContents(id),
  });
}

export function useNoteContents(id: string) {
  return useSuspenseQuery({
    queryKey: ["notes", "contents", id],
    queryFn: () => getNoteContents(id),
  });
}

async function deleteNote(id: string, now: number) {
  // TODO: transaction
  return await Promise.all([
    dbPromise.then((db) => db.put("metadata", { ...noteZero, id, mtime: now })),
    dbPromise.then((db) => db.delete("contents", id)),
  ]);
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
      queryClient.setQueryData(["notes", "contents"], () => "");
    },
  });
}
