export interface MetaCore {
  id: string;
  mtime: number; // last modification of note
}

export interface MetaPayload {
  // btime <= mtime <= ttime
  btime: number; // creation of note;
  ttime: number; // last modification of contents
  trash: boolean; // wether not is in trash
  title: string;
}

export type NoteMeta = MetaPayload & MetaCore;

export type MetaUpdate = Partial<MetaPayload> & MetaCore;

export const noteZero: NoteMeta = {
  id: "",
  mtime: 0,
  btime: 0,
  ttime: 0,
  trash: false,
  title: "",
};

export const contentsZero = "# ";
