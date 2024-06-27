import { useCreateNote } from "@/hooks/createNote";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/notes/create/")({
  component: Component,
});

function Component() {
  const createNote = useCreateNote();
  useEffect(() => {
    createNote();
  }, [createNote]);
  return null;
}
