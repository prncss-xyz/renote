import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "./plugins/onChange";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { CodeNode } from "@lexical/code";

import ToolbarPlugin from "./plugins/toolBar";
import { Card, Flex, IconButton } from "@radix-ui/themes";
import { NoteMeta } from "@/core/models";
import { TrashIcon } from "@radix-ui/react-icons";
import { useDeleteNote, useNotesMeta } from "@/db";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import { findNext, selectNotes } from "@/core/noteSelection";

function onError(error: unknown) {
  console.error(error);
}

const config = {
  namespace: "MyEditor",
  nodes: [
    CodeNode,
    HeadingNode,
    LinkNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    HorizontalRuleNode,
  ],
  onError,
};

function useDelete(id: string) {
  const search = useSearch({ strict: false });
  const notes = useNotesMeta(selectNotes(search as any)).data;
  const { mutate: deleteNote } = useDeleteNote();
  const router = useRouter();
  return useCallback(() => {
    deleteNote(id, {
      onSettled: () =>
        router.navigate({
          to: "/notes/edit/$id",
          params: { id: findNext(notes, id) },
          search: search as any,
        }),
    });
  }, [id]);
}

export function Editor({
  meta,
  contents,
}: {
  meta: NoteMeta;
  contents: string;
}) {
  const deleteNote = useDelete(meta.id);
  return (
    <LexicalComposer
      key={meta.id}
      initialConfig={{ ...config, editorState: contents }}
    >
      <Flex direction="column" gap="1">
        <Flex justify="end">
          <IconButton onClick={deleteNote}>
            <TrashIcon />
          </IconButton>
        </Flex>
        {/* <ToolbarPlugin /> */}
        <Card>
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<></>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </Card>
        <MarkdownShortcutPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin meta={meta} contents={contents} />
      </Flex>
      <HistoryPlugin />
    </LexicalComposer>
  );
}
