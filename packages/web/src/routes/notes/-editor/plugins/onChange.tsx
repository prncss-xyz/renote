import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
import { MetaUpdate, NoteMeta } from "@/core/models";
import { useFlushedDebounced } from "@/utils/deduper";
import { useUpsertNote } from "@/db";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { deserialize } from "../encoding";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any;

function fold<T>(node: Node, acc: T, cb: (acc: T, node: Node) => T) {
  if (!node) return acc;
  acc = cb(acc, node);
  for (const child of node.children ?? []) {
    acc = fold(child, acc, cb);
  }
  return acc;
}

function find(node: Node, cb: (node: Node) => unknown) {
  if (cb(node)) return node;
  for (const child of node.children ?? []) {
    if (find(child, cb)) return child;
  }
}

function toText(node: Node) {
  return fold(node, "", (acc, node) => (node.text ? acc + node.text : ""));
}

interface Data {
  meta: MetaUpdate;
  contents: string;
  pathname: string;
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
  const navigate = useNavigate();
  const pathname = useLocation({ select: ({ pathname }) => pathname });
  const search = useSearch({ from: "/notes" });
  const localCommit = useCallback(
    ({ meta, contents, pathname }: Data) => {
      mutate(
        { meta, contents },
        {
          onSettled: () => {
            if (pathname === "/notes/create")
              navigate({
                to: "/notes/edit/$id",
                params: {
                  id: meta.id,
                },
                search,
              });
          },
        },
      );
    },
    [mutate, navigate, search],
  );
  const update = useFlushedDebounced(500, (data: Data) => localCommit(data));
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const now = Date.now();
        const newContents = deserialize();
        if (newContents === contents) return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        contents = newContents;
        const serizalizedState = editorState.toJSON();
        update({
          meta: {
            id: meta.id,
            mtime: now,
            ttime: now,
            title: toText(
              find(serizalizedState.root, (node) => node.type === "heading"),
            ).trim(),
          },
          contents: newContents,
          pathname,
        });
      });
    });
  }, [meta, editor, pathname]);
  return null;
}
