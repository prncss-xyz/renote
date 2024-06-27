interface Id {
  id: string;
}

export interface NoteMeta extends Id {
  // btime <= mtime <= ttime
  btime: number; // creation of note;
  mtime: number; // last modification of note
  ttime: number; // last modification of contents
  title: string;
}

export type NoteMetaUpdate = Partial<NoteMeta> & Id;

export const noteZero: NoteMeta = {
  id: "",
  btime: 0,
  mtime: 0,
  ttime: 0,
  title: "",
};

export const contentsZero =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';
