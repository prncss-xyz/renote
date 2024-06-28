import { NoteMeta } from "./models";

export const sortByNames = {
  title: "Title",
  mtime: "Modified",
  btime: "Created",
};

export type SortByOpts = keyof typeof sortByNames;

const sortByZero: SortByOpts = "title";

export function validateSortBy(sortBy: unknown): SortByOpts {
  return String(sortBy) in sortByNames ? (sortBy as SortByOpts) : sortByZero;
}

export type SelectNotesOpts = {
  asc: boolean;
  sortBy: SortByOpts;
};

export const selectNotesOptsZero = {
  asc: false,
  sortBy: sortByZero,
};

function btimeSort(a: NoteMeta, b: NoteMeta) {
  return b.btime - a.btime;
}

function mtimeSort(a: NoteMeta, b: NoteMeta) {
  return b.mtime - a.mtime;
}

// TODO: make configurable
const collator = new Intl.Collator();

function titleSort(a: NoteMeta, b: NoteMeta) {
  const cmp = collator.compare(b.title, a.title);
  if (cmp === 0) return btimeSort(a, b);
  return cmp;
}

function getSortCb(sortBy: SortByOpts) {
  switch (sortBy) {
    case "title":
      return titleSort;
    case "mtime":
      return mtimeSort;
    case "btime":
      return btimeSort;
  }
}

export function validateSelectNotesOpts(opts: Record<string, unknown>) {
  return {
    asc: Boolean(opts.asc),
    sortBy: validateSortBy(opts.sortBy),
  };
}

export function selectNotes({ asc, sortBy }: SelectNotesOpts) {
  return function (notes: NoteMeta[]) {
    notes = notes.filter((note) => note.btime);
    const sgn = asc ? 1 : -1;
    const cb = getSortCb(sortBy);
    notes.sort((a, b) => sgn * cb(a, b));
    return notes;
  };
}

export function findNext(notes: NoteMeta[], id: string) {
  if (id == "") return "";
  if (notes.at(-1)?.id === id) {
    return notes.at(-2)?.id ?? "";
  }
  const index = notes.findIndex((note) => note.id === id) + 1;
  return notes[index]?.id ?? "";
}
