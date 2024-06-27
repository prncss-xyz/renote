export function getDeduper<T>(delai: number, cb: (key: string, value: T) => void) {
  let lastKey = "";
  let handle: any = 0;
  let lastValue: T | null = null;
  function handler() {
    cb(lastKey, lastValue as T);
  }
  return function (key: string, value: T) {
    if (lastKey !== key && lastValue !== null) handler();
    lastKey = key;
    lastValue = value;
    clearTimeout(handle);
    handle = setTimeout(handler, delai);
  };
}
