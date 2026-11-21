/** "Notify Me" list kept on this device so we can announce when an upcoming app goes live. */
const KEY = "rkx-watch";

export type Watched = { id: string; name: string };

export function readWatchlist(): Watched[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => x && typeof x.id === "string" && typeof x.name === "string") : [];
  } catch {
    return [];
  }
}

export function writeWatchlist(list: Watched[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
}

export function isWatched(id: string) {
  return readWatchlist().some((w) => w.id === id);
}

export function addWatch(item: Watched) {
  const list = readWatchlist().filter((w) => w.id !== item.id);
  writeWatchlist([...list, item]);
}

/** Returns watched names that now exist as live apps, and removes them from the list. */
export function popLaunched(liveNames: string[]): string[] {
  const live = new Set(liveNames.map((n) => n.trim().toLowerCase()));
  const list = readWatchlist();
  const launched = list.filter((w) => live.has(w.name.trim().toLowerCase()));
  if (launched.length) writeWatchlist(list.filter((w) => !launched.includes(w)));
  return launched.map((w) => w.name);
}
