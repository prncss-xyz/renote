import { createFileRoute } from "@tanstack/react-router";
import { Flex } from "@radix-ui/themes";

export const Route = createFileRoute("/notes/empty")({
  component: Component,
});

function Component() {
  return <Flex px="1">This collection is currently empty. Please create a new note.</Flex>;
}
