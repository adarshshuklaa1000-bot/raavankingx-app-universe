import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: InstallEvent | null = null;
const subs = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    subs.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    subs.forEach((f) => f());
  });
}

/** Browser "Install app" support. available=false when the browser doesn't offer it. */
export function usePwaInstall() {
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const update = () => setAvailable(!!deferred);
    update();
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    subs.add(update);
    return () => {
      subs.delete(update);
    };
  }, []);

  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    deferred = null;
    setAvailable(false);
    return choice.outcome === "accepted";
  };

  return { available, installed, install };
}
