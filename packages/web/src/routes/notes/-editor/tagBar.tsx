import { useNoteMeta, useUpsertNoteMetaValue } from "@/db";
import { useReset } from "@/utils/reset";
import {
  Cross2Icon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Button,
  CheckboxGroup,
  Dialog,
  Flex,
  IconButton,
  TextField,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { deepEqual } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useProcessedNotes } from "../-processedNotes/hooks";
import { useHotkeyHandler } from "@/hooks/hotkey";

function Tag({ name }: { name: string }) {
  return <Badge>{name}</Badge>;
}

const localBindings = {
  toggleTag: { key: "Enter" },
  confirm: { key: "Enter", ctrl: true },
};

function toggle<T>(xs: T[], x: T) {
  const index = xs.indexOf(x);
  if (index === -1) {
    // TODO: use collator
    return [...xs, x].sort();
  } else {
    return [...xs.slice(0, index), ...xs.slice(index + 1)];
  }
}

function Content({
  id,
  init,
  close,
}: {
  id: string;
  init: string[];
  close: () => void;
}) {
  const allTags = useProcessedNotes((state) => state.allTags);
  const [tags, setTags] = useState(allTags);
  const [chosenTags, setChosenTags] = useState(init);
  const [filter, setFilter] = useState("");
  const visibleTags = useMemo(
    () => tags.filter((tag) => tag.includes(filter)),
    [filter, tags],
  );

  const createTag = useCallback(() => {
    // TODO: use collator
    const tag = filter.trim();
    if (!tag) return;
    setTags([...tags, tag].sort());
    setChosenTags([...tags, tag].sort());
    setFilter("");
  }, [filter, tags, setFilter, setTags, setChosenTags]);
  const { onKeyDown, useRegister } = useHotkeyHandler(localBindings);
  const toggleTag = useCallback(() => {
    const firstTag = visibleTags.at(0);
    if (firstTag) {
      setChosenTags(toggle(chosenTags, firstTag));
      setFilter("");
      return;
    }
    createTag();
  }, [chosenTags, createTag, visibleTags]);
  useRegister("toggleTag", toggleTag);
  const { mutate } = useUpsertNoteMetaValue({ tags: chosenTags });

  const disabled = deepEqual(chosenTags, init);
  const confirm = useCallback(() => {
    if (disabled) return;
    close();
    mutate({ id, mtime: Date.now() });
  }, [close, disabled, id, mutate]);
  useRegister("confirm", confirm);
  return (
    <Dialog.Content aria-describedby={undefined}>
      <Flex direction="row" justify="between" gap="1">
        <Dialog.Title>Change tags</Dialog.Title>
        <Dialog.Close>
          <Flex>
            <Cross2Icon />
            <VisuallyHidden>Close</VisuallyHidden>
          </Flex>
        </Dialog.Close>
      </Flex>
      <Flex direction="column" gap="3">
        <Flex direction="row" justify="between" align="center" gap="2">
          <TextField.Root
            placeholder="Enter tag name"
            value={filter}
            onKeyDown={onKeyDown}
            onChange={(e) => setFilter(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>
        <CheckboxGroup.Root
          value={chosenTags}
          onValueChange={setChosenTags}
          style={{ maxHeight: 100, overflowY: "auto" }}
        >
          {visibleTags.map((tag) => (
            <CheckboxGroup.Item key={tag} value={tag}>
              {tag}
            </CheckboxGroup.Item>
          ))}
        </CheckboxGroup.Root>
        {filter.length > 0 && !tags.includes(filter) && (
          <Button variant="ghost" onClick={createTag}>
            <PlusIcon />
            <Box style={{ textAlign: "start", width: "100%" }}>
              Create <b>{filter}</b>
            </Box>
          </Button>
        )}
        <Flex direction="row" gap="2">
          <Button variant="solid" onClick={confirm} disabled={disabled}>
            Confirm
          </Button>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
        </Flex>
      </Flex>
    </Dialog.Content>
  );
}

export function TagBar({ id }: { id: string }) {
  const tags = useNoteMeta(id).data.tags;
  const [key, reset] = useReset();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), [setOpen]);
  return (
    <Flex align="center" gap="1" wrap="wrap">
      {tags.map((tag) => (
        <Tag key={tag} name={tag} />
      ))}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger onClick={reset}>
          <IconButton variant="ghost">
            <Tooltip content="Change tags">
              <Box>
                <PlusIcon />
                <VisuallyHidden>Change tags</VisuallyHidden>
              </Box>
            </Tooltip>
          </IconButton>
        </Dialog.Trigger>
        <Content key={key} id={id} init={tags} close={close} />
      </Dialog.Root>
    </Flex>
  );
}
