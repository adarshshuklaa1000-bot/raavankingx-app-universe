import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";

// Client-only: the admin session lives in the browser, and every write is also enforced by database rules.
export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => adminHead("Admin Panel"),
  component: AdminShell,
});
