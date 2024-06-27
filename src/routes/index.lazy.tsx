import { Navigate, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Component,
});

function Component() {
  return <Navigate to="/notes/edit" search={(x) => x as any} />;
}
