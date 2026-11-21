import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Mail } from "lucide-react";
import { Header } from "@/components/app/Header";
import { PublicShell } from "@/components/app/PublicShell";
import { SmartImage } from "@/components/app/SmartImage";
import { InstallCard } from "@/components/app/InstallCard";
import { ownerQuery, useConfig } from "@/services/content";
import { asLinks, type LinkItem } from "@/services/types";
import { isHttpsUrl } from "@/services/url";
import { useOpenApp } from "@/webview/use-open-app";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner & About — RaavanKingX" },
      { name: "description", content: "Meet the owner of RaavanKingX, official links, contact and social profiles." },
      { property: "og:title", content: "Owner & About — RaavanKingX" },
      { property: "og:description", content: "Meet the owner of RaavanKingX, official links, contact and social profiles." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerPage,
});

function OwnerPage() {
  const owner = useQuery(ownerQuery);
  const { data: config } = useConfig();
  const o = owner.data;

  return (
    <PublicShell>
      <Header />
      <main className="mx-auto max-w-3xl space-y-5 px-4 pt-6">
        <section className="app-card rounded-3xl p-6 text-center">
          {owner.isLoading ? (
            <div className="mx-auto size-24 rounded-full skeleton-shimmer" />
          ) : (
            <SmartImage
              src={o?.photo_url}
              alt={o?.name ?? "Owner"}
              eager
              className="mx-auto size-24 rounded-full border-2 border-vip shadow-[var(--shadow-gold)]"
            />
          )}
          <h1 className="mt-4 font-display text-2xl font-black tracking-wide text-foreground">{o?.name ?? " "}</h1>
          {o?.tagline && <p className="font-display text-sm font-bold tracking-widest text-vip">{o.tagline}</p>}
          {o?.about && <p className="mx-auto mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">{o.about}</p>}
        </section>

        <LinkSection title="CONTACT" links={asLinks(o?.contact_links)} />
        <LinkSection title="SOCIAL & OFFICIAL LINKS" links={asLinks(o?.social_links)} />

        <section className="rounded-3xl border border-border bg-secondary/60 p-5">
          <h2 className="font-display text-lg font-black tracking-widest">ABOUT {config?.app_name ?? "RAAVANKINGX"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {config?.app_tagline ?? "ALL YOUR APPS IN ONE PLACE"} — study platforms, web apps and online tools open right
            inside the app, with no jumping between browsers.
          </p>
        </section>

        {config && <InstallCard config={config} />}
      </main>
    </PublicShell>
  );
}

function LinkSection({ title, links }: { title: string; links: LinkItem[] }) {
  const openApp = useOpenApp();
  if (links.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 font-display text-sm font-black tracking-[0.25em] text-muted-foreground">{title}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((l, i) => {
          const isMail = l.url.startsWith("mailto:");
          const isTel = l.url.startsWith("tel:");
          const inner = (
            <>
              {isMail ? <Mail className="size-4 text-neon" /> : <ExternalLink className="size-4 text-neon" />}
              <span className="min-w-0 flex-1 truncate font-display text-sm font-bold">{l.label}</span>
            </>
          );
          const cls = "flex w-full items-center gap-3 rounded-2xl neon-border bg-secondary/70 px-4 py-3 text-left";
          return (
            <li key={`${l.url}-${i}`}>
              {isMail || isTel ? (
                <a href={l.url} className={cls}>
                  {inner}
                </a>
              ) : isHttpsUrl(l.url) ? (
                <button type="button" className={cls} onClick={() => openApp({ url: l.url, title: l.label })}>
                  {inner}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
