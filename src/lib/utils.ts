import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Listener = (key: string) => void;

export class EventBus {
  private listeners = new Set<Listener>();

  emit(key: string) {
    for (const fn of this.listeners) fn(key);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
}