import { NoteMeta } from "./models";
import { z } from "zod";

export const sortByNames = {
  title: "Title",
  btime: "Created",
  mtime: "Modified",
};

export type SortByOpts = keyof typeof sortByNames;
const sortByZero: SortByOpts = "title";
function validateSortBy(sortBy: unknown) {
  return typeof sortBy === "string" ? sortBy in sortByNames : false;
}

export enum SearchTag {
  NO_SELECTION = "",
  UNTAGGED = " ",
}

export const selectNotesOptsSchema = z.object({
  asc: z.boolean().catch(false),
  sortBy: z.custom<SortByOpts>(validateSortBy).catch(sortByZero),
  trash: z.boolean().catch(false),
  tag: z.string().catch(SearchTag.NO_SELECTION),
});

export type SelectNotesOpts = z.infer<typeof selectNotesOptsSchema>;

export const selectNotesOptsZero: SelectNotesOpts = {
  asc: false,
  sortBy: sortByZero,
  trash: false,
  tag: "",
};

export interface ExpendNotesOpts {
  trash: boolean;
  tags: string[];
}

const expendNotesOptsZero: ExpendNotesOpts = {
  trash: false,
  tags: [],
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

export function isSearchable(note: NoteMeta) {
  return note.btime && !note.trash && note.title.length > 0;
}

export function processNotes(search: SelectNotesOpts, notes: NoteMeta[]) {
  const allTags = new Set<string>();
  let untagged = false;
  const expend: ExpendNotesOpts = expendNotesOptsZero;
  const filteredNotes: NoteMeta[] = [];
  for (const note of notes) {
    if (!note.btime) continue;
    if (note.tags.length) note.tags.forEach((tag) => allTags.add(tag));
    else untagged = true;
    if (note.trash === true) {
      expend.trash = true;
    }
    if (note.trash !== search.trash) continue;
    expend.tags.push(...note.tags);
    if (search.tag === SearchTag.UNTAGGED) {
      if (note.tags.length) continue;
    } else if (search.tag === SearchTag.NO_SELECTION) {
      // do nothing
    } else {
      if (!note.tags.includes(search.tag)) continue;
    }
    filteredNotes.push(note);
  }
  const sgn = search.asc ? 1 : -1;
  const cb = getSortCb(search.sortBy);
  filteredNotes.sort((a, b) => sgn * cb(a, b));
  // TDDO: use collator
  return {
    expend,
    notes: filteredNotes,
    allTags: Array.from(allTags).sort(),
    untagged,
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
