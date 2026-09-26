import { z } from "zod";
import { profileSchema, type PlayerProfile } from "../types";
export const STORAGE_KEY = "picklebridge.profile.v1";
const envelope = z.object({ version: z.literal(1), profile: profileSchema });
export interface PlayerRepository {
  load(): PlayerProfile | null;
  save(profile: PlayerProfile): void;
  reset(): void;
  raw(): string | null;
}
export class LocalPlayerRepository implements PlayerRepository {
  constructor(
    private storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  ) {}
  load() {
    const raw = this.raw();
    if (!raw) return null;
    try {
      return envelope.parse(JSON.parse(raw)).profile;
    } catch {
      throw new Error(
        "Your saved profile could not be read. Export a backup before resetting it.",
      );
    }
  }
  raw() {
    return this.storage.getItem(STORAGE_KEY);
  }
  save(profile: PlayerProfile) {
    const data = envelope.parse({ version: 1, profile });
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      throw new Error(
        "Your browser could not save this change. Free some storage or allow local storage, then try again.",
      );
    }
  }
  reset() {
    this.storage.removeItem(STORAGE_KEY);
  }
}
