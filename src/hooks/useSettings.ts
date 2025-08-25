import { configManager, Settings } from "@/lib/config";
import { useEffect, useSyncExternalStore } from "react";


export function useSetting<K extends keyof Settings>(
  key: K,
  fallback?: Settings[K]
): [Settings[K] | undefined, (value: Settings[K]) => Promise<void>] {
  const subscribe = (notify: () => void) =>
    configManager.subscribe(({ key: changed }) => {
      if (changed === key || changed === "*") notify();
    });

  const getSnapshot = () => {
    const v = configManager.get(key);
    return v === undefined ? fallback : v;
  };

  const getServerSnapshot = () => fallback;

  useEffect(() => {
    configManager.fetch(key).catch(console.error);
  }, [key]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = async (newValue: Settings[K]) => {
    await configManager.set(key, newValue);
  };

  return [value, setValue];
}