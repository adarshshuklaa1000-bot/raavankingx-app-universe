import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SingletonForm } from "@/admin/SingletonForm";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { ownerSections } from "@/admin/schemas";
import { ownerQuery } from "@/services/content";

export const Route = createFileRoute("/admin/owner")({
  head: () => adminHead("Owner Profile"),
  component: OwnerAdmin,
});

function OwnerAdmin() {
  const owner = useQuery(ownerQuery);
  return (
    <>
      <PageTitle title="Owner Profile" />
      <SingletonForm table="owner_profile" id="main" row={owner.data} loading={owner.isLoading} sections={ownerSections} label="Owner profile" />
    </>
  );
}
