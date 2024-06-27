import { createLazyFileRoute } from "@tanstack/react-router";
import { contentsZero, noteZero } from "@/core/models";
import { Editor } from "@/components/editor";

export const Route = createLazyFileRoute("/notes/create/$id")({
  component: Component,
});

function Component() {
  const { id } = Route.useParams();
  const meta = { ...noteZero, id, btime: Date.now() };
  return <Editor meta={meta} contents={contentsZero} />;
}
