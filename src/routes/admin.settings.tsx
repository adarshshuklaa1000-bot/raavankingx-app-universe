import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SingletonForm } from "@/admin/SingletonForm";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { settingsSections } from "@/admin/schemas";
import { configQuery } from "@/services/content";

export const Route = createFileRoute("/admin/settings")({
  head: () => adminHead("Settings"),
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const config = useQuery(configQuery);
  return (
    <>
      <PageTitle title="Settings" />
      <SingletonForm table="app_config" id="global" row={config.data} loading={config.isLoading} sections={settingsSections} label="App settings" />
    </>
  );
}
