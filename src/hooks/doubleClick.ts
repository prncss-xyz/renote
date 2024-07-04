import { MouseEvent, useCallback } from "react";

export function useDoubleClick(cb: () => void) {
  return useCallback(
    (e: MouseEvent<Element>) => {
      if (e.detail === 2) {
        cb();
      }
    },
    [cb],
  );
}
