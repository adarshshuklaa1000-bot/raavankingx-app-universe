import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Manager } from "@/admin/Manager";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { bannerFields } from "@/admin/schemas";
import { bannersQuery } from "@/services/content";
import type { Banner } from "@/services/types";

export const Route = createFileRoute("/admin/banners")({
  head: () => adminHead("Banners"),
  component: BannersAdmin,
});

const summary = (b: Banner) => ({
  title: b.title || "Untitled banner",
  subtitle: [b.subtitle, b.action_url].filter(Boolean).join(" · "),
  image: b.image_url,
});

function BannersAdmin() {
  const banners = useQuery(bannersQuery);
  return (
    <>
      <PageTitle title="Banners" />
      <Manager
        table="banners"
        singular="Banner"
        rows={banners.data ?? []}
        loading={banners.isLoading}
        fields={bannerFields}
        defaults={{ is_published: true, action_label: "OPEN" }}
        summary={summary}
      />
    </>
  );
}
