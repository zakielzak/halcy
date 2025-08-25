import { LazyStore } from "@tauri-apps/plugin-store";
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

export const configManager = new ConfigManager();