import { configManager, Settings } from "../lib/config";
import { useSyncExternalStore } from "react";

type ArrayUpdater<T> = (fn: (prev: T) => T) => Promise<void>;

export function useSetting<K extends keyof Settings>(
  key: K,
  fallback: Settings[K]
) {
  const state = useSyncExternalStore(
    configManager.subscribe.bind(configManager),
    () => configManager.get(key) ?? fallback
  );

  const set = async (value: Settings[K]) => configManager.set(key, value);

  const setArray = Array.isArray(state)
    ? ((async (updater: (prev: Settings[K]) => Settings[K]) => {
        const current = configManager.get(key);

        const updated = updater(current ?? fallback);
        await configManager.set(key, updated);
      }) as ArrayUpdater<Settings[K]>)
    : undefined;

  return [state, set, setArray] as const;
}

/* 
type ArrayUpdateFunction<T> = (
  updater: (current: T) => T
) => Promise<void>;

type UseSettingResult<K extends keyof Settings> =
  Settings[K] extends unknown[]
   ? [
    Settings[K],
    (value: Settings[K]) => Promise<void>,
    ArrayUpdateFunction<Settings[K]>
   ]
   : [
    Settings[K],
    (value: Settings[K]) => Promise<void>,
    undefined
   ];


export function useSetting<K extends keyof Settings>(
  key: K,
  fallback: Settings[K]
): UseSettingResult<K> {
  const subscribe = (notify: () => void) =>
    configManager.subscribe(({ key: changed }) => {
      if ( changed === key || changed === "*") notify();
    });

    const getSnapshot = () => configManager.get(key) ?? fallback;
    const getServerSnapshot = () => fallback;

    useEffect(() => {
      configManager.fetch(key).catch(console.error);
    }, [key]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) as Settings[K];

    const setValue = async (newValue: Settings[K]) => {
      await configManager.set(key, newValue);
    }

    const updateArray = async (
      updater: (current: any) => any
    ): Promise<void> => {
      const currentArray = configManager.get(key) as any[] || [];
      const updatedArray = updater(currentArray);
      await configManager.set(key, updatedArray);
    }

    if (Array.isArray(value)) {
      return [value, setValue, updateArray] as UseSettingResult<K>;
    } else {
      return [value, setValue, undefined] as UseSettingResult<K>;
    }
} */
