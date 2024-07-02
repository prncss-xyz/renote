import { useEffect } from "react";

export function useHotkey(
  { key, ctrl }: { key: string; ctrl?: boolean },
  callback: () => void,
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key && Boolean(ctrl) === e.ctrlKey) {
        e.preventDefault();
        callback();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [callback]);
}
