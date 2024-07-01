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

/* import ToolbarPlugin from "./plugins/toolBar"; */
import { Card, Flex, IconButton, VisuallyHidden } from "@radix-ui/themes";
import { NoteMeta, contentsZero, noteZero } from "@/core/models";
import { TrashIcon } from "@radix-ui/react-icons";
import { useDeleteNote, useNotesMeta } from "@/db";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { findNext, selectNotes } from "@/core/noteSelection";
import { serialize } from "./encoding";

export function EditorCreate({ id }: { id: string }) {
  const meta = { ...noteZero, id };
  const contents = contentsZero;
  return <Editor meta={meta} contents={contents} />;
}

export function Editor({
  meta,
  contents,
}: {
  meta: NoteMeta;
  contents: string;
}) {
  return (
    <LexicalComposer
      key={meta.id}
      initialConfig={{
        ...config,
        editorState: () => serialize(contents),
      }}
    >
      <Flex direction="column" gap="1">
        <Flex justify="end">
          <DeleteNote id={meta.id} />
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

function DeleteNote({ id }: { id: string }) {
  const onClick = useDelete(id);
  return (
    <IconButton onClick={onClick}>
      <TrashIcon />
      <VisuallyHidden>Delete note</VisuallyHidden>
    </IconButton>
  );
}

// TODO: we need a global state to make note disappear from noteList before deletion

// When we want to delete a note, we must first unmount the note's route
// in order to avoid a "note has been deleted" message
function useDelete(id: string) {
  const { mutate: deleteNote } = useDeleteNote();
  const shouldDelete = useRef(false);
  const { navigate } = useRouter();
  const search = useSearch({ strict: false });
  const notes = useNotesMeta(selectNotes(search as any)).data;
  const onClick = useCallback(() => {
    const id_ = findNext(notes, id);
    if (id_)
      navigate({
        to: "/notes/edit/$id",
        params: { id: id_ },
        search: (x: any) => x,
      });
    else
      navigate({
        to: "/notes/create",
        search: (x: any) => x,
      });
    shouldDelete.current = true;
  }, [navigate, id, notes]);
  useEffect(() => {
    return () => {
      if (!shouldDelete.current) return;
      deleteNote(id);
    };
  }, [shouldDelete, id]);
  return onClick;
}
