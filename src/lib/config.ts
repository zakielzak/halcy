import { LazyStore } from "@tauri-apps/plugin-store";

export interface Settings {
  rootDir: string;
  libraryHistory: string[];
}

type Listener = (newState: Settings) => void;

class ConfigManager {
  private readonly store = new LazyStore("settings.json");
  private state: Settings = { rootDir: "", libraryHistory: [] };
  private listeners: Listener[] = [];
  private ready = this.load(); // start async init once

  private async load(): Promise<void> {
    const saved = await this.store.get<Partial<Settings>>("settings");
    if (saved) Object.assign(this.state, saved);
    this.notify(); // initial emit
  }

  // Current value (may be stale until ready)
  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.state[key];
  }

  // Set & persist in one go
  async set<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<void> {
    await this.ready; // Wait until initial load
    this.state[key] = value;
    await this.store.set("settings", this.state);
    await this.store.save();
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      const i = this.listeners.indexOf(listener);
      if (i !== -1) this.listeners.splice(i, 1);
    };
  }
  private notify() {
    // emit micro-task to allow multiple synchronous sets
    queueMicrotask(() => this.listeners.forEach((l) => l(this.state)));
  }
}

export const configManager = new ConfigManager();

/* import { LazyStore } from "@tauri-apps/plugin-store";
import { EventBus } from "./utils";


export interface Settings {
    rootDir: string;
    libraryHistory: string[]
}

type ChangeEvent = { key: keyof Settings | "*" };

class ConfigManager {
  private store = new LazyStore("settings.json");
  private state: Settings = {
    rootDir: "",
    libraryHistory: [],
  };
  private emitter = new EventBus();
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    this.initialized = true;
    const saved = (await this.store.get<Partial<Settings>>("settings")) || {};
    this.state = { ...this.state, ...saved };
    this.emitter.emit("*");
  }

  get<K extends keyof Settings>(key: K): Settings[K] | undefined {
    return this.state[key];
  }

  async fetch<K extends keyof Settings>(
    key: K
  ): Promise<Settings[K] | undefined> {
    await this.init();
    const fresh = (await this.store.get<Partial<Settings>>("settings")) || {};
    this.state = { ...this.state, ...fresh };
    this.emitter.emit("*");
    return this.state[key];
  }

  async set<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<void> {
    await this.init();
    this.state[key] = value;
    await this.store.set("settings", this.state);
    await this.store.save();
    this.emitter.emit(key as string);
  }

  subscribe(listener: (e: ChangeEvent) => void): () => void {
    return this.emitter.subscribe((key: string) => {
      listener({ key: key as keyof Settings | "*" });
    });
  }
}

export const configManager = new ConfigManager(); */
