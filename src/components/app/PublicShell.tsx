import { BottomNav } from "./BottomNav";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-safe-nav animate-in fade-in duration-300">
      {children}
      <BottomNav />
    </div>
  );
}
