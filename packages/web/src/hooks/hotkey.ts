import { useCallback, useEffect, useState } from "react";

type Keymap = { key: string } & Partial<{
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}>;

export type Bindings<T extends string> = Record<T, Keymap>;

function keyCmp(binding: Keymap, e: KeyboardEvent | React.KeyboardEvent) {
  return (
    e.key === binding.key &&
    Boolean(binding.ctrl) === e.ctrlKey &&
    Boolean(binding.meta) === e.metaKey &&
    Boolean(binding.shift) === e.shiftKey
  );
}

function keyFind<T extends string>(
  bindings: Bindings<T>,
  e: KeyboardEvent | React.KeyboardEvent,
): T | "" {
  for (const [name, binding] of Object.entries(bindings)) {
    if (keyCmp(binding as Keymap, e)) {
      return name as T;
    }
  }
  return "";
}

export function useHotkeyHandler<T extends string>(keymaps: Bindings<T>) {
  const [handlers] = useState(() => new Map<T, (() => void) | undefined>());
  const onKeyDown = useCallback(
    (e: KeyboardEvent | React.KeyboardEvent) => {
      const name = keyFind(keymaps, e);
      if (!name) return;
      e.preventDefault();
      handlers.get(name)?.();
    },
    [keymaps, handlers],
  );
  function useRegister(name: T, callback: () => void) {
    useEffect(() => {
      const oldHandler = handlers.get(name);
      handlers.set(name, callback);
      return () => {
        handlers.set(name, oldHandler);
      };
    }, [name, callback]);
  }
  return { onKeyDown, useRegister };
}

export function useGlobalHotkey<T extends string>(keymaps: Bindings<T>) {
  const { onKeyDown, useRegister } = useHotkeyHandler(keymaps);
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
  return { useRegisterGlobal: useRegister };
}
