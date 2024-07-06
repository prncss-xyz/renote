import { processNotes, SelectNotesOpts } from "@/core/noteSelection";
import { useNotesMeta } from "@/db";
import { ReactNode, useEffect, useState } from "react";
import { createStore } from "zustand";
import { ProcessedNotesCtx } from "./core";

//REFACT: zustand wont be needed after react 19
export function ProcessedNotesProvider({
  search,
  children,
}: {
  search: SelectNotesOpts;
  children: ReactNode;
}) {
  const notes = useNotesMeta().data;
  const [store] = useState(() => {
    const res = processNotes(search, notes);
    return createStore(() => res);
  });
  useEffect(
    () => store.setState(processNotes(search, notes)),
    [notes, search, store],
  );
  return (
    <ProcessedNotesCtx.Provider value={store}>
      {children}
    </ProcessedNotesCtx.Provider>
  );
}
