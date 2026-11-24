import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { logAction } from "@/services/admin";
import { FieldInput, toPayload, type FieldDef, type FormValues } from "./fields";

/** Editor for one-row tables (global settings, owner profile). */
export function SingletonForm({
  table,
  id,
  row,
  loading,
  sections,
  label,
}: {
  table: "app_config" | "owner_profile";
  id: string;
  row: Record<string, unknown> | null | undefined;
  loading: boolean;
  sections: { title: string; fields: FieldDef[] }[];
  label: string;
}) {
  const queryClient = useQueryClient();
  const fields = sections.flatMap((s) => s.fields);
  const [values, setValues] = useState<FormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Load the saved row; live updates from another admin refresh the form unless you have unsaved edits.
  useEffect(() => {
    if (loading || dirty) return;
    const v: FormValues = {};
    for (const f of fields) v[f.key] = row?.[f.key] ?? (f.type === "bool" ? false : "");
    setValues(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row, loading]);

  const save = async () => {
    if (!values) return;
    const res = toPayload(fields, values);
    if ("error" in res) return toast.error(res.error);
    setSaving(true);
    const { error } = await supabase.from(table as "app_config").upsert({ id, ...res.data } as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    await logAction("update", label);
    setDirty(false);
    toast.success(`${label} saved — live in the app now`);
    queryClient.invalidateQueries({ queryKey: [table] });
  };

  if (!values) return <div className="h-64 rounded-2xl skeleton-shimmer" />;

  return (
    <form
      className="space-y-5 pb-24"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {sections.map((s) => (
        <section key={s.title} className="space-y-3 rounded-2xl border border-border bg-secondary/60 p-4">
          <h2 className="font-display text-sm font-black tracking-[0.2em] text-neon">{s.title.toUpperCase()}</h2>
          {s.fields.map((f) => (
            <FieldInput
              key={f.key}
              field={f}
              value={values[f.key]}
              onChange={(v) => {
                setDirty(true);
                setValues((cur) => ({ ...cur, [f.key]: v }));
              }}
            />
          ))}
        </section>
      ))}
      <div className="sticky bottom-3 flex justify-end">
        <Button type="submit" variant="open" size="lg" disabled={saving || !dirty}>
          <Save /> {saving ? "Saving…" : dirty ? "Save changes" : "All saved"}
        </Button>
      </div>
    </form>
  );
}
