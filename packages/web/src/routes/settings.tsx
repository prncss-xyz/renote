import { useClearNotes } from "@/db";
import { Button, Dialog, Flex } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: Component,
});

function Component() {
  return (
    <Flex direction="column" gap="4">
      <Flex>
        <ClearAll />
      </Flex>
    </Flex>
  );
}

function ClearAll() {
  const { mutate } = useClearNotes();
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Clear all</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Clear all</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Do you really want to clear all your notes?
        </Dialog.Description>
        <Flex direction="row" gap="1">
          <Dialog.Close>
            <Button variant="solid">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              variant="outline"
              onClick={() => {
                mutate();
              }}
            >
              Clear all
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
