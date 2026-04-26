import { useEffect, useMemo, useState } from 'react';

type Serializer<T> = (value: T) => string;
type Parser<T> = (raw: string) => T;

function defaultSerializer<T>(value: T) {
  return JSON.stringify(value);
}

function defaultParser<T>(raw: string) {
  return JSON.parse(raw) as T;
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
  options?: {
    serializer?: Serializer<T>;
    parser?: Parser<T>;
    enabled?: boolean;
  }
) {
  const enabled = options?.enabled ?? true;
  const serializer = options?.serializer ?? defaultSerializer;
  const parser = options?.parser ?? defaultParser;

  const initial = useMemo(() => initialValue, [initialValue]);

  const [value, setValue] = useState<T>(() => {
    if (!enabled) return typeof initial === 'function' ? (initial as () => T)() : initial;
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return typeof initial === 'function' ? (initial as () => T)() : initial;
      return parser(raw);
    } catch {
      return typeof initial === 'function' ? (initial as () => T)() : initial;
    }
  });

  useEffect(() => {
    if (!enabled) return;
    try {
      localStorage.setItem(key, serializer(value));
    } catch {
      // ignore quota/security errors
    }
  }, [enabled, key, serializer, value]);

  return [value, setValue] as const;
}

