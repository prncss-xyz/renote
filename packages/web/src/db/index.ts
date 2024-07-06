import { MetaPayload, MetaUpdate, NoteMeta, noteZero } from "@/core/models";
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

const getNotesMetaOpts = queryOptions({
  queryKey: ["notes", "metadata"],
  queryFn: getNotesMeta,
});

export function fetchNotesMeta(queryClient: QueryClient) {
  return queryClient.fetchQuery(getNotesMetaOpts);
}

export function ensureNotesMeta(queryClient: QueryClient) {
  return queryClient.ensureQueryData(getNotesMetaOpts);
}

export async function fetchNote(queryClient: QueryClient, id: string) {
  const [meta, contents] = await Promise.all([
    queryClient
      .fetchQuery(getNotesMetaOpts)
      .then((arr) => arr.find((note) => note.id === id)),
    queryClient.fetchQuery(getNoteContentsOpts(id)),
  ]);
  return { meta, contents };
}

export function useNoteMeta(id: string) {
  const notesMeta = useNotesMeta((arr) => {
    const meta = arr.find((m) => m.id === id);
    return meta ? [meta] : [];
  }).data;
  const data = notesMeta[0];
  if (!data) throw new Error(`Note ${id} not found`);
  return { data };
}

export function useNotesMeta(
  select?: ((data: NoteMeta[]) => NoteMeta[]) | undefined,
) {
  return useSuspenseQuery({
    ...getNotesMetaOpts,
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

async function upsertDbNoteMeta(meta: MetaUpdate) {
  // PERF: reading this all the time is really bad
  const db = await dbPromise;
  const old = (await db.get("metadata", meta.id)) ?? {
    ...noteZero,
    btime: meta.mtime,
  };
  const tx = db.transaction(["metadata"], "readwrite");
  tx.objectStore("metadata").put({ ...old, ...meta });
  await tx.done;
}

async function upsertDbNote(meta: MetaUpdate, contents: string) {
  // PERF: reading this all the time is really bad
  const db = await dbPromise;
  const old = (await db.get("metadata", meta.id)) ?? {
    ...noteZero,
    btime: meta.mtime,
  };
  const tx = db.transaction(["metadata", "contents"], "readwrite");
  tx.objectStore("metadata").put({ ...old, ...meta });
  tx.objectStore("contents").put(contents, meta.id);
  await tx.done;
}

function upsertCacheMeta(arr: NoteMeta[], meta: MetaUpdate) {
  const index = arr.findIndex((m) => m.id === meta.id);
  if (index === -1) {
    return [...arr, { ...noteZero, btime: meta.mtime, ...meta }];
  }
  return arr.with(index, { ...arr[index], ...meta });
}

export function useUpsertNoteMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meta: MetaUpdate) => upsertDbNoteMeta(meta),
    onMutate: async (meta) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["notes", "metadata"] }),
      ]);
      queryClient.setQueryData(["notes", "metadata"], (old: NoteMeta[]) => {
        return upsertCacheMeta(old, meta);
      });
    },
  });
}

export function useUpsertNoteMetaValue(meta: Partial<MetaPayload>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mtime }: MetaUpdate) =>
      upsertDbNoteMeta({ ...meta, id, mtime }),
    onMutate: async ({ id, mtime }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["notes", "metadata"] }),
      ]);
      queryClient.setQueryData(["notes", "metadata"], (old: NoteMeta[]) =>
        upsertCacheMeta(old, { ...meta, id, mtime }),
      );
    },
  });
}

export function useUpsertNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meta, contents }: { meta: MetaUpdate; contents: string }) =>
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

export function ensureNoteContents(queryClient: QueryClient, id: string) {
  return queryClient.ensureQueryData(getNoteContentsOpts(id));
}

export function useNoteContents(id: string) {
  return useSuspenseQuery(getNoteContentsOpts(id));
}

export function useDeleteNote() {
  return useUpsertNoteMetaValue({ trash: true });
}

export function useRestoreNote() {
  return useUpsertNoteMetaValue({ trash: false });
}

async function purgeNote({ id, mtime }: { id: string; mtime: number }) {
  const db = await dbPromise;
  const tx = db.transaction(["metadata", "contents"], "readwrite");
  tx.objectStore("metadata").put({ ...noteZero, id, mtime: mtime });
  tx.objectStore("contents").delete(id);
  await tx.done;
}

export function usePurgeNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (arg: { id: string; mtime: number }) => purgeNote(arg),
    onMutate: async ({ id, mtime }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["notes", "metadata"] }),
        queryClient.cancelQueries({ queryKey: ["notes", "contents", id] }),
      ]);
      queryClient.setQueryData(["notes", "metadata"], (old: NoteMeta[]) =>
        upsertCacheMeta(old, { ...noteZero, id, mtime }),
      );
    },
  });
}
