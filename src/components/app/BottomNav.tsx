import { Link } from "@tanstack/react-router";
import { Crown, Home, Rocket } from "lucide-react";

const TABS = [
  { to: "/", label: "HOME", icon: Home },
  { to: "/owner", label: "OWNER", icon: Crown },
  { to: "/soon", label: "SOON", icon: Rocket },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-safe z-40 mx-auto w-[min(92%,26rem)] rounded-3xl border border-border/60 bg-nav/95 px-3 py-2 shadow-2xl backdrop-blur"
    >
      <ul className="grid grid-cols-3">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="group flex flex-col items-center gap-1 rounded-2xl py-1.5 text-muted-foreground transition-colors data-[status=active]:text-gold"
            >
              <Icon className="size-6 transition-transform group-active:scale-90 group-data-[status=active]:glow-gold" />
              <span className="font-display text-[11px] font-bold tracking-[0.2em]">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
