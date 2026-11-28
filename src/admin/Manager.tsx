import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SmartImage } from "@/components/app/SmartImage";
import { logAction } from "@/services/admin";
import { FieldInput, toPayload, type FieldDef, type FormValues } from "./fields";

export type ManagedTable = "apps" | "upcoming_apps" | "banners" | "categories" | "announcements" | "social_platforms";
type Row = { id: string; is_published?: boolean; enabled?: boolean; display_order?: number };

/** Untyped handle for the generic manager; every table shares id / is_published / display_order. */
const tbl = (t: ManagedTable) => supabase.from(t as "apps");

export type RowSummary = { title: string; subtitle?: string; image?: string | null; badges?: string[]; emoji?: string };

export function Manager<T extends Row>({
  table,
  singular,
  rows,
  loading,
  fields,
  defaults,
  summary,
  ordered = true,
  rowActions,
  preview,
}: {
  table: ManagedTable;
  singular: string;
  rows: T[];
  loading: boolean;
  fields: FieldDef[];
  defaults: FormValues;
  summary: (row: T) => RowSummary;
  ordered?: boolean;
  rowActions?: (row: T) => React.ReactNode;
  preview?: (values: FormValues) => React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; values: FormValues } | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: [table] });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const m = summary(r);
      return `${m.title} ${m.subtitle ?? ""}`.toLowerCase().includes(s);
    });
  }, [rows, q, summary]);

  const save = async () => {
    if (!editing) return;
    const res = toPayload(fields, editing.values);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    setSaving(true);
    const name = String(res.data["name"] ?? res.data["title"] ?? singular);
    try {
      if (editing.id) {
        const { error } = await tbl(table).update(res.data as never).eq("id", editing.id);
        if (error) throw error;
        await logAction("update", `${singular}: ${name}`);
        toast.success(`${singular} saved`);
      } else {
        const payload = { ...res.data };
        if (ordered && !fields.some((f) => f.key === "display_order")) payload["display_order"] = rows.reduce((m, r) => Math.max(m, r.display_order ?? 0), 0) + 1;
        const { error } = await tbl(table).insert(payload as never);
        if (error) throw error;
        await logAction("create", `${singular}: ${name}`);
        toast.success(`${singular} added`);
      }
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (row: T, value: boolean) => {
    const { error } = await tbl(table).update({ is_published: value } as never).eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await logAction(value ? "publish" : "unpublish", `${singular}: ${summary(row).title}`);
    refresh();
  };
  const toggleEnabled = async (row: T, enabled: boolean) => {
    const { error } = await tbl(table).update({ enabled } as never).eq("id", row.id);
    if (error) toast.error(error.message);
    else { await logAction(enabled ? "enable" : "disable", `${singular}: ${summary(row).title}`); refresh(); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    const changes = next
      .map((r, i) => ({ id: r.id, order: i + 1, old: r.display_order }))
      .filter((c) => c.order !== c.old);
    const results = await Promise.all(
      changes.map((c) => tbl(table).update({ display_order: c.order } as never).eq("id", c.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) toast.error(failed.error.message);
    else await logAction("reorder", `${singular}: ${summary(item).title}`, dir < 0 ? "Moved up" : "Moved down");
    refresh();
  };

  const remove = async () => {
    if (!deleting) return;
    const { error } = await tbl(table).delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else {
      await logAction("delete", `${singular}: ${summary(deleting).title}`);
      toast.success(`${singular} deleted`);
    }
    setDeleting(null);
    refresh();
  };

  const openEdit = (row: T | null) => {
    const values: FormValues = {};
    for (const f of fields) values[f.key] = row ? (row as Record<string, unknown>)[f.key] : defaults[f.key];
    setEditing({ id: row?.id ?? null, values });
  };

  const canReorder = ordered && !q.trim();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${singular.toLowerCase()}s`} className="pl-9" aria-label="Search" />
        </div>
        <Button variant="open" onClick={() => openEdit(null)}>
          <Plus /> Add {singular.toLowerCase()}
        </Button>
      </div>

      <p className="font-mono text-[11px] tracking-widest text-muted-foreground">
        {rows.length} TOTAL · {rows.filter((r) => r.is_published !== false && r.enabled !== false).length} VISIBLE
      </p>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {q ? "Nothing matches your search." : `No ${singular.toLowerCase()}s yet. Tap "Add" to create one.`}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((row) => {
            const m = summary(row);
            const index = rows.indexOf(row);
            return (
              <li key={row.id} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 p-2.5">
                {m.emoji ? (
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-background text-2xl">{m.emoji}</span>
                ) : m.image !== undefined ? (
                  <SmartImage src={m.image} alt="" className="size-12 shrink-0 rounded-xl border border-border bg-background" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold">{m.title}</p>
                  {m.subtitle && <p className="truncate text-xs text-muted-foreground">{m.subtitle}</p>}
                  {!!m.badges?.length && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.badges.map((b) => (
                        <span key={b} className="rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-accent-foreground">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {rowActions?.(row)}
                  {canReorder && (
                    <div className="flex flex-col">
                      <Button variant="ghost" size="icon" className="size-7" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}>
                        <ArrowUp />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7" aria-label="Move down" disabled={index === rows.length - 1} onClick={() => move(index, 1)}>
                        <ArrowDown />
                      </Button>
                    </div>
                  )}
                  {row.is_published !== undefined && (
                    <Switch checked={row.is_published} onCheckedChange={(v) => togglePublish(row, v)} aria-label={row.is_published ? "Visible — tap to hide" : "Hidden — tap to show"} />
                  )}
                  {row.enabled !== undefined && <Switch checked={row.enabled} onCheckedChange={(v) => toggleEnabled(row, v)} aria-label={row.enabled ? "Enabled — tap to deactivate" : "Disabled — tap to activate"} />}
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(row)}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete" className="text-destructive" onClick={() => setDeleting(row)}>
                    <Trash2 />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {canReorder && rows.length > 1 && (
        <p className="text-[11px] text-muted-foreground sm:hidden">Tip: on a wider screen you can reorder with the arrows.</p>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && !saving && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">{editing?.id ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}</DialogTitle>
            <DialogDescription>Changes appear in the app instantly after saving.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              {fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  value={editing.values[f.key]}
                  onChange={(v) => setEditing((cur) => (cur ? { ...cur, values: { ...cur.values, [f.key]: v } } : cur))}
                />
              ))}
              {preview && <section className="space-y-2"><h3 className="font-display text-sm font-bold">Live preview</h3>{preview(editing.values)}</section>}
              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" variant="open" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting ? summary(deleting).title : ""}”?</AlertDialogTitle>
            <AlertDialogDescription>This removes it from the app for everyone. It can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
