import {
  $convertToMarkdownString,
  TRANSFORMERS,
  $convertFromMarkdownString,
} from "@lexical/markdown";

// FIX: when true, introduces inconsistencies between serialization and deserialization
const shouldPreserveNewlines = false;

export function deserialize() {
  return $convertToMarkdownString(
    TRANSFORMERS,
    undefined,
    shouldPreserveNewlines,
  );
}

export function serialize(conent: string) {
  return $convertFromMarkdownString(
    conent,
    TRANSFORMERS,
    undefined,
    shouldPreserveNewlines,
  );
}
