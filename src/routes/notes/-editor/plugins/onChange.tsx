import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
import { NoteMeta } from "@/core/models";
import { useFlushedDebounced } from "@/utils/deduper";
import { useUpsertNote } from "@/db";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { deserialize } from "../encoding";
import { pushSync } from "@/api";

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

interface Data {
  meta: NoteMeta;
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
  const localCommit = useCallback(
    ({ meta, contents, pathname }: Data) => {
      if (pathname !== "/notes/create") pushSync({ meta, contents });
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
                search: (x: any) => x,
              });
          },
        },
      );
    },
    [pathname, navigate],
  );
  const update = useFlushedDebounced(500, (data: Data) => localCommit(data));
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const now = Date.now();
        const newContents = deserialize();
        if (newContents === contents) return;
        contents = newContents;
        const serizalizedState = editorState.toJSON();
        update({
          meta: {
            ...meta,
            btime: meta.btime || now,
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
