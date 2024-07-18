import {
  Box,
  Dialog,
  Flex,
  IconButton,
  TextField,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { useNotesMeta } from "@/db";
import fuzzysort from "fuzzysort";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Link, useRouter } from "@tanstack/react-router";
import { isSearchable, selectNotesOptsZero } from "@/core/noteSelection";
import { useCallback, useMemo, useState } from "react";
import { useGlobalHotkey, useHotkeyHandler } from "@/hooks/hotkey";

const highlightClass = "fuzzy__highlight";

const localBindings = {
  confirmFuzzySearch: { key: "Enter" },
};

function Contents({ close }: { close: () => void }) {
  const { navigate } = useRouter();
  const notes = useNotesMeta((notes) => notes.filter(isSearchable)).data;
  const [query, setQuery] = useState("");
  const choices = useMemo(
    () =>
      fuzzysort.go(query, notes, {
        key: "title",
        limit: 5,
      }),
    [query, notes],
  );
  const { onKeyDown, useRegister } = useHotkeyHandler(localBindings);
  useRegister(
    "confirmFuzzySearch",
    useCallback(() => {
      close();
      if (choices[0]) {
        navigate({
          to: "/notes/view/$id",
          params: { id: choices[0].obj.id },
          search: selectNotesOptsZero,
        });
      }
    }, [choices, close, navigate]),
  );
  return (
    <Flex direction="column" gap="1">
      <TextField.Root
        className="fuzzy__input"
        value={query}
        onKeyDown={onKeyDown}
        onChange={(e) => setQuery(e.target.value)}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>
      <Flex direction="column" height="140px" gap="1">
        {choices.map((choice) => (
          <Dialog.Close key={choice.obj.id}>
            <Link
              className="fuzzy__item"
              to="/notes/view/$id"
              params={{ id: choice.obj.id }}
              search={selectNotesOptsZero}
              dangerouslySetInnerHTML={{
                __html: choice.highlight(
                  `<span class="${highlightClass}">`,
                  `</span>`,
                ),
              }}
            />
          </Dialog.Close>
        ))}
      </Flex>
    </Flex>
  );
}

const globalBindings = { openFuzzySearch: { key: "k", ctrl: true } };

export function Fuzzy() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const { useRegisterGlobal } = useGlobalHotkey(globalBindings);
  useRegisterGlobal("openFuzzySearch", () => setOpen(true));
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton variant="outline">
          <Tooltip content="[ctrl+k] Fuzzy search title">
            <Box>
              <MagnifyingGlassIcon />
              <VisuallyHidden>Fuzzy search title</VisuallyHidden>
            </Box>
          </Tooltip>
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px" aria-describedby={undefined}>
        <Flex direction="row" justify="between" gap="1">
          <Dialog.Title>Fuzzy search title</Dialog.Title>
          <Dialog.Close>
            <Flex>
              <Cross2Icon />
              <VisuallyHidden>Close</VisuallyHidden>
            </Flex>
          </Dialog.Close>
        </Flex>
        <Contents close={close} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
