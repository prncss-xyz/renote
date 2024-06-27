import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { NoteMeta } from "@/core/models";
import { getDeduper } from "@/utils/deduper";
import { useUpsertNote } from "@/db";
import { useRouter } from "@tanstack/react-router";

function fold<T>(node: any, acc: T, cb: (acc: T, node: any) => T) {
  if (!node) return acc;
  acc = cb(acc, node);
  for (const child of node.children ?? []) {
    acc = fold(child, acc, cb);
  }
  return acc;
}

function find(node: any, cb: (node: any) => unknown) {
  if (cb(node)) return node;
  for (const child of node.children ?? []) {
    if (find(child, cb)) return child;
  }
}

function toText(node: any) {
  return fold(node, "", (acc, node) => (node.text ? acc + node.text : ""));
}

export function OnChangePlugin({
  meta,
  contents,
}: {
  meta: NoteMeta;
  contents: string;
}) {
  const [editor] = useLexicalComposerContext();
  const { mutate } = useUpsertNote();
  const router = useRouter();
  useEffect(() => {
    const commit = getDeduper(
      1000,
      (
        _key,
        {
          meta,
          contents,
        }: {
          meta: NoteMeta;
          contents: string;
        },
      ) =>
        mutate(
          { meta, contents },
          {
            onSettled: () => {
              router.navigate({
                to: "/notes/edit/$id",
                params: { id: meta.id },
                search: (x: any) => x,
              });
            },
          },
        ),
    );
    return editor.registerUpdateListener(({ editorState }) => {
      const serizalizedState = editorState.toJSON();
      const now = Date.now();
      const newContents = JSON.stringify(serizalizedState);
      if (newContents === contents) return;
      commit(meta.id, {
        meta: {
          ...meta,
          mtime: now,
          ttime: now,
          title: toText(
            find(serizalizedState.root, (node) => node.type === "heading"),
          ),
        },
        contents: newContents,
      });
    });
  }, [editor]);
  return null;
}
