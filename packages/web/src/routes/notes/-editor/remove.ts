import { findNext } from "@/core/noteSelection";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useRef, useCallback, useEffect } from "react";
import { useProcessedNotes } from "../-processedNotes/hooks";

// TODO: we need a global state to make note disappear from noteList before deletion

// When we want to delete a note, we must first unmount the note's route
// in order to avoid a "note has been deleted" message
export function useRemove(
  id: string,
  after: (arg: { id: string; mtime: number }) => void,
) {
  const shouldDelete = useRef(false);
  const { navigate } = useRouter();
  const search = useSearch({ from: "/notes" });
  const notes = useProcessedNotes((state) => state.notes);
  const onClick = useCallback(() => {
    const id_ = findNext(notes, id);
    if (id_)
      navigate({
        to: "/notes/edit/$id",
        params: { id: id_ },
        search,
      });
    else
      navigate({
        to: "/notes/empty",
        search,
      });
    shouldDelete.current = true;
  }, [notes, id, navigate, search]);
  useEffect(() => {
    return () => {
      if (!shouldDelete.current) return;
      after({ id, mtime: Date.now() });
    };
  }, [shouldDelete, id, after]);
  return onClick;
}
