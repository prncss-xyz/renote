import { processNotes } from "@/core/noteSelection";
import { createContext } from "react";
import { StoreApi } from "zustand";

export type ProcessedNotes = ReturnType<typeof processNotes>;

export const ProcessedNotesCtx = createContext<null | StoreApi<ProcessedNotes>>(null);
