import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { NoteMeta } from "@/core/models";
import { getDeduper } from "@/utils/deduper";
import { useUpsertNote } from "@/db";
import { useNavigate } from "@tanstack/react-router";
import { deserialize } from "../encoding";

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
  const navigate = useNavigate();
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
          // this is useful when commming from '/notes/create/$id'
          {
            onSettled: () => {
              navigate({
                to: "/notes/edit/$id",
                params: {
                  id: meta.id,
                },
                search: (x: any) => x,
              });
            },
          },
        ),
    );
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const now = Date.now();
        const newContents = deserialize();
        if (newContents === contents) return;
        const serizalizedState = editorState.toJSON();
        commit(meta.id, {
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
        });
      });
    });
  }, [meta, editor]);
  const id = meta.id;
  useEffect(() => {
    return () => console.log("should flush", id);
  }, [id, editor]);
  return null;
}
