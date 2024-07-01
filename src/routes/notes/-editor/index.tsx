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
import { Card, Flex } from "@radix-ui/themes";
import { NoteMeta, contentsZero, noteZero } from "@/core/models";
import { serialize } from "./encoding";
import { NavNotes } from "./NavNotes";

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
      <Flex direction="column" gap="2">
        <NavNotes id={meta.id} />
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
