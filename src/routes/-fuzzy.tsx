import { Dialog, Flex, IconButton, VisuallyHidden } from "@radix-ui/themes";
import { useNotesMeta } from "@/db";
import fuzzysort from "fuzzysort";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Link, useRouter } from "@tanstack/react-router";
import { selectNotesOptsZero } from "@/core/noteSelection";
import { useMemo, useState } from "react";
import { useHotkey } from "@/hooks/hotkey";

const highlightClass = "fuzzy__highlight";

function Selector({ close }: { close: () => void }) {
  const { navigate } = useRouter();
  const notes = useNotesMeta().data;
  const [query, setQuery] = useState("");
  const choices = useMemo(
    () =>
      fuzzysort.go(query, notes, {
        key: "title",
        limit: 5,
      }),
    [query, notes],
  );
  return (
    <Flex direction="column" gap="1">
      <input
        className="fuzzy__input"
        value={query}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          close();
          if (choices[0]) {
            navigate({
              to: "/notes/edit/$id",
              params: { id: choices[0].obj.id },
              search: selectNotesOptsZero,
            });
          }
        }}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Flex direction="column" height="140px" gap="1">
        {choices.map((choice) => (
          <Dialog.Close key={choice.obj.id}>
            <Link
              className="fuzzy__item"
              to="/notes/edit/$id"
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

export function Fuzzy() {
  const [open, setOpen] = useState(false);
  useHotkey({ key: "k", ctrl: true }, () => setOpen(true));
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton>
          <MagnifyingGlassIcon />
          <VisuallyHidden>Fuzzy search title</VisuallyHidden>
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
        <Selector close={() => setOpen(false)} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
