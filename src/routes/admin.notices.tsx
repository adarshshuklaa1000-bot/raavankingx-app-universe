import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Manager } from "@/admin/Manager";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { noticeFields } from "@/admin/schemas";
import { activeAnnouncements, announcementsQuery } from "@/services/content";
import type { Announcement } from "@/services/types";

export const Route = createFileRoute("/admin/notices")({
  head: () => adminHead("Notices"),
  component: NoticesAdmin,
});

function noticeState(a: Announcement): string {
  if (!a.is_published) return "HIDDEN";
  if (activeAnnouncements([a]).length) return "SHOWING NOW";
  if (a.starts_at && new Date(a.starts_at).getTime() > Date.now()) return "SCHEDULED";
  return "EXPIRED";
}

const summary = (a: Announcement) => ({
  title: a.title,
  subtitle: a.body,
  badges: [noticeState(a), a.priority === "urgent" && "URGENT", a.is_blinking && "BLINKING"].filter((b): b is string => !!b),
});

function NoticesAdmin() {
  const notices = useQuery(announcementsQuery);
  return (
    <>
      <PageTitle title="Notices" />
      <Manager
        table="announcements"
        singular="Notice"
        rows={notices.data ?? []}
        loading={notices.isLoading}
        fields={noticeFields}
        defaults={{ priority: "normal", is_published: true }}
        summary={summary}
        ordered={false}
      />
    </>
  );
}
