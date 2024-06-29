import { useEffect, useRef } from "react";

export function getDebounced<T>(delai: number, cb: (value: T) => void) {
  let dirty = false;
  let handle: ReturnType<typeof setTimeout>;
  let lastValue: T;
  function handler() {
    cb(lastValue);
  }
  function debounced(value: T) {
    dirty = true;
    lastValue = value;
    clearTimeout(handle);
    handle = setTimeout(handler, delai);
  }
  function flush() {
    if (dirty) {
      clearTimeout(handle);
      handler();
    }
  }
  return [debounced, flush] as const;
}

// creates a debounced version of a callback function, delaying its execution
// until a specified time has elapsed since the last invocation or the component unmounts
export function useFlushedDebounced<T>(delai: number, cb: (value: T) => void) {
  const ref = useRef((_value: T) => {});
  useEffect(() => {
    const [debounced, flush] = getDebounced(delai, cb);
    ref.current = debounced;
    return flush;
  }, [delai, cb]);
  return (value: T) => ref.current(value);
}
