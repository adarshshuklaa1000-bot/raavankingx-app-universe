import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Manager } from "@/admin/Manager";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { categoryFields } from "@/admin/schemas";
import { appsQuery, categoriesQuery } from "@/services/content";
import type { Category } from "@/services/types";

export const Route = createFileRoute("/admin/categories")({
  head: () => adminHead("Categories"),
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const cats = useQuery(categoriesQuery);
  const apps = useQuery(appsQuery);
  const count = (id: string) => (apps.data ?? []).filter((a) => a.category_id === id).length;
  const summary = (c: Category) => ({ title: c.name, subtitle: `${count(c.id)} apps`, emoji: c.icon });
  return (
    <>
      <PageTitle title="Categories" />
      <Manager
        table="categories"
        singular="Category"
        rows={cats.data ?? []}
        loading={cats.isLoading}
        fields={categoryFields}
        defaults={{ icon: "✦", is_published: true }}
        summary={summary}
      />
    </>
  );
}
