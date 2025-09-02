import { configManager, Settings } from "../lib/config";
import { useSyncExternalStore } from "react";

type ArrayUpdater<T> = (updater: (prev: T) => T) => Promise<void>;

// Type for the return value of useSetting.
type UseSettingResult<K extends keyof Settings> = [
  Settings[K],
  (value: Settings[K]) => Promise<void>,
  Settings[K] extends unknown[] ? ArrayUpdater<Settings[K]> : undefined
];

export function useSetting<K extends keyof Settings>(
  key: K,
  fallback: Settings[K]
): UseSettingResult<K> {
  const subscribe = (notify: () => void) =>
    configManager.subscribe(() => notify());

  const getSnapshot = () => configManager.get(key) ?? fallback;
  const value = useSyncExternalStore(subscribe, getSnapshot) as Settings[K];

  const set = async (newValue: Settings[K]) => {
    await configManager.set(key, newValue);
  };

  const updateArray = (async (updater) => {
    const current = configManager.get(key) as Settings[K];
    const updated = updater(current ?? fallback);
    await configManager.set(key, updated);
  }) as ArrayUpdater<Settings[K]>;

  return [
    value,
    set,
    Array.isArray(value) ? updateArray : undefined,
  ] as UseSettingResult<K>;
}

