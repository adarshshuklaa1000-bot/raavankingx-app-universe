import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Manager } from "@/admin/Manager";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { appFields } from "@/admin/schemas";
import { appsQuery, categoriesQuery } from "@/services/content";
import type { AppItem } from "@/services/types";

export const Route = createFileRoute("/admin/apps")({
  head: () => adminHead("Apps & Websites"),
  component: AppsAdmin,
});

function AppsAdmin() {
  const apps = useQuery(appsQuery);
  const cats = useQuery(categoriesQuery);
  const fields = useMemo(() => appFields(cats.data ?? []), [cats.data]);
  const catName = useMemo(() => new Map((cats.data ?? []).map((c) => [c.id, `${c.icon} ${c.name}`])), [cats.data]);
  const summary = useCallback(
    (a: AppItem) => ({
      title: a.name,
      subtitle: [a.kind === "website" ? "Website" : "App", a.category_id ? catName.get(a.category_id) : null, a.website_url]
        .filter(Boolean)
        .join(" · "),
      image: a.logo_url,
      badges: [
        a.is_vip && "VIP",
        a.is_new && "NEW",
        a.is_popular && "POPULAR",
        a.is_updated && "UPDATED",
        a.is_featured && "FEATURED",
        a.webview_mode === "restricted" && "NOTE FIRST",
      ].filter((b): b is string => !!b),
    }),
    [catName],
  );
  return (
    <>
      <PageTitle title="Apps & Websites" />
      <Manager
        table="apps"
        singular="App"
        rows={apps.data ?? []}
        loading={apps.isLoading}
        fields={fields}
        defaults={{ kind: "app", webview_mode: "compatible", is_published: true, is_new: true }}
        summary={summary}
      />
    </>
  );
}
