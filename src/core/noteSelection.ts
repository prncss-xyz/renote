import { NoteMeta } from "./models";

export const sortBy = {
  mtime: "Modified",
  btime: "Created",
};

export type SortByOpts = keyof typeof sortBy;

export type SelectNotesOpts = {
  desc: boolean;
  sortBy: SortByOpts;
};

export function selectNotes({ desc, sortBy }: SelectNotesOpts) {
  return function (notes: NoteMeta[]) {
    notes = notes.filter((note) => note.btime);
    const sgn = desc ? -1 : 1;
    notes.sort((a, b) => sgn * (b[sortBy] - a[sortBy]));
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
