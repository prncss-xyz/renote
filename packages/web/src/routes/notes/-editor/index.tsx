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
import { Box, Button, Card, Flex } from "@radix-ui/themes";
import { NoteMeta, contentsZero, noteZero } from "@/core/models";
import { serialize } from "./encoding";
import { NavNotes } from "./NavNotes";

export function EditorCreate({ id }: { id: string }) {
  const meta = { ...noteZero, id };
  const contents = contentsZero;
  return (
    <Editor meta={meta} contents={contents} editable={true} deleted={false} />
  );
}

import "./index.css";
import { useLocation, useRouter, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import { useDoubleClick } from "@/hooks/doubleClick";
import { usePurgeNote, useRestoreNote } from "@/db";
import { useRemove } from "./remove";

export function Editor({
  meta,
  contents,
  editable,
  deleted,
}: {
  meta: NoteMeta;
  contents: string;
  editable: boolean;
  deleted: boolean;
}) {
  const edit = useEdit(meta.id, deleted);
  const handleDoubleClick = useDoubleClick(edit);
  return (
    <LexicalComposer
      key={meta.id}
      initialConfig={{
        ...config,
        editorState: () => serialize(contents),
        editable,
      }}
    >
      <Flex direction="column" gap="2" overflow="hidden">
        <NavNotes id={meta.id} deleted={deleted} />
        {deleted && <Deleted id={meta.id} />}
        {/* <ToolbarPlugin /> */}
        <Box overflowY="auto">
          <Card className="editor" onClick={handleDoubleClick}>
            <RichTextPlugin
              contentEditable={<ContentEditable />}
              placeholder={<></>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </Card>
        </Box>
        <MarkdownShortcutPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin meta={meta} contents={contents} />
      </Flex>
      <HistoryPlugin />
    </LexicalComposer>
  );
}

function Restore({ id }: { id: string }) {
  const { mutate } = useRestoreNote();
  const onClick = useRemove(id, mutate);
  return <Button onClick={onClick}>Restore</Button>;
}

function Purge({ id }: { id: string }) {
  const { mutate } = usePurgeNote();
  const onClick = useRemove(id, mutate);
  return <Button onClick={onClick}>Purge</Button>;
}

function Deleted({ id }: { id: string }) {
  return (
    <Flex direction="row" align="baseline" justify="between" gap="2">
      <Box>This note has been deleted.</Box>
      <Flex gap="1">
        <Restore id={id} />
        <Purge id={id} />
      </Flex>
    </Flex>
  );
}

function useEdit(id: string, deleted: boolean) {
  const { pathname } = useLocation();
  const disabled = pathname.startsWith("/notes/edit");
  const { navigate } = useRouter();
  const search = useSearch({ from: "/notes" });
  return useCallback(() => {
    if (disabled || deleted) return;
    navigate({
      to: "/notes/edit/$id",
      params: { id },
      search,
    });
  }, [disabled, deleted, navigate, id, search]);
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
