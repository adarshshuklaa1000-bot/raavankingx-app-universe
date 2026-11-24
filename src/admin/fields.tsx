import { Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/app/SmartImage";
import { uploadImage } from "@/services/admin";
import { isHttpsUrl, isSafeImageUrl, normalizeUrl, cleanText } from "@/services/url";
import type { LinkItem } from "@/services/types";

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "bool"
  | "number"
  | "select"
  | "date"
  | "datetime"
  | "color"
  | "tags"
  | "links";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Column is NOT NULL: an empty optional text saves as "" instead of null. */
  notNull?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  folder?: string;
  min?: number;
  max?: number;
  placeholder?: string;
};

export type FormValues = Record<string, unknown>;

const pad = (n: number) => String(n).padStart(2, "0");
function toLocalInput(iso: unknown) {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Validates and converts form values into database values. Returns an error message or the payload. */
export function toPayload(fields: FieldDef[], values: FormValues): { error: string } | { data: FormValues } {
  const out: FormValues = {};
  for (const f of fields) {
    let v = values[f.key];
    switch (f.type) {
      case "text":
      case "textarea": {
        const s = cleanText(String(v ?? ""), f.type === "text" ? 200 : 4000).trim();
        if (f.required && !s) return { error: `${f.label} is required.` };
        v = s || (f.required || f.notNull ? s : null);
        break;
      }
      case "url": {
        const s = normalizeUrl(String(v ?? ""));
        if (!s) {
          if (f.required) return { error: `${f.label} is required.` };
          v = null;
        } else if (!isHttpsUrl(s)) return { error: `${f.label} must be a secure https:// link.` };
        else v = s;
        break;
      }
      case "image": {
        const s = String(v ?? "").trim();
        if (!s) {
          if (f.required) return { error: `${f.label} is required.` };
          v = null;
        } else if (!isSafeImageUrl(s)) return { error: `${f.label} must be an https image link or an upload.` };
        else v = s;
        break;
      }
      case "number": {
        if (v === "" || v == null) {
          if (f.required) return { error: `${f.label} is required.` };
          v = null;
        } else {
          const n = Number(v);
          if (!Number.isFinite(n)) return { error: `${f.label} must be a number.` };
          if (f.min != null && n < f.min) return { error: `${f.label} must be at least ${f.min}.` };
          if (f.max != null && n > f.max) return { error: `${f.label} must be at most ${f.max}.` };
          v = Math.round(n);
        }
        break;
      }
      case "date":
        v = v ? String(v) : null;
        if (f.required && !v) return { error: `${f.label} is required.` };
        break;
      case "datetime":
        v = v ? new Date(String(v)).toISOString() : null;
        break;
      case "color": {
        const s = String(v ?? "").trim();
        if (s && !/^#[0-9a-f]{6}$/i.test(s)) return { error: `${f.label} must look like #0284FF.` };
        v = s || null;
        break;
      }
      case "bool":
        v = !!v;
        break;
      case "select":
        v = v ? String(v) : null;
        if (f.required && !v) return { error: `${f.label} is required.` };
        break;
      case "tags":
        v = (Array.isArray(v) ? v : String(v ?? "").split(/[\n,]/))
          .map((t) => String(t).trim().toLowerCase())
          .filter(Boolean);
        break;
      case "links": {
        const list = (Array.isArray(v) ? (v as LinkItem[]) : []).filter((l) => l.label.trim() || l.url.trim());
        for (const l of list) {
          const url = l.url.trim();
          const ok = url.startsWith("mailto:") || url.startsWith("tel:") || isHttpsUrl(normalizeUrl(url));
          if (!l.label.trim() || !ok) return { error: `Each link in ${f.label} needs a name and an https, mailto: or tel: address.` };
        }
        v = list.map((l) => ({
          label: cleanText(l.label, 60).trim(),
          url: l.url.startsWith("mailto:") || l.url.startsWith("tel:") ? l.url.trim() : normalizeUrl(l.url),
        }));
        break;
      }
    }
    out[f.key] = v;
  }
  return { data: out };
}

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${field.key}`;
  const label = (
    <Label htmlFor={id} className="font-display text-xs font-bold tracking-wider text-muted-foreground">
      {field.label}
      {field.required && <span className="text-vip"> *</span>}
    </Label>
  );
  const help = field.help && <p className="text-[11px] text-muted-foreground">{field.help}</p>;

  if (field.type === "bool") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
        <div>
          {label}
          {help}
        </div>
        <Switch id={id} checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = <Textarea id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={field.placeholder} />;
      break;
    case "number":
      control = <Input id={id} type="number" inputMode="numeric" value={value == null ? "" : String(value)} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "date":
      control = <Input id={id} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "datetime":
      control = <Input id={id} type="datetime-local" value={toLocalInput(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")} />;
      break;
    case "color":
      control = (
        <div className="flex gap-2">
          <input type="color" aria-label={field.label} value={/^#[0-9a-f]{6}$/i.test(String(value ?? "")) ? String(value) : "#0284ff"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent" />
          <Input id={id} value={String(value ?? "")} placeholder="Default" onChange={(e) => onChange(e.target.value)} />
          {!!value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Reset
            </Button>
          )}
        </div>
      );
      break;
    case "select":
      control = (
        <select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
          {!field.required && <option value="">— None —</option>}
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "tags":
      control = (
        <Textarea id={id} rows={3} placeholder={field.placeholder} value={Array.isArray(value) ? value.join("\n") : String(value ?? "")} onChange={(e) => onChange(e.target.value.split("\n"))} />
      );
      break;
    case "image":
      control = <ImageInput id={id} value={String(value ?? "")} onChange={onChange} folder={field.folder ?? "misc"} />;
      break;
    case "links":
      control = <LinksInput value={Array.isArray(value) ? (value as LinkItem[]) : []} onChange={onChange} />;
      break;
    default:
      control = (
        <Input id={id} type={field.type === "url" ? "url" : "text"} inputMode={field.type === "url" ? "url" : undefined} placeholder={field.placeholder ?? (field.type === "url" ? "https://" : undefined)} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      );
  }

  return (
    <div className="space-y-1.5">
      {label}
      {control}
      {help}
    </div>
  );
}

function ImageInput({ id, value, onChange, folder }: { id: string; value: string; onChange: (v: string) => void; folder: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="flex items-center gap-3">
      <SmartImage src={value} alt="" className="size-14 shrink-0 rounded-xl border border-border bg-background" />
      <div className="min-w-0 flex-1 space-y-2">
        <Input id={id} value={value} placeholder="https:// or upload" onChange={(e) => onChange(e.target.value)} />
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <Button type="button" variant="neon" size="sm" disabled={busy} onClick={() => ref.current?.click()}>
          <Upload /> {busy ? "Uploading…" : "Upload image"}
        </Button>
      </div>
    </div>
  );
}

function LinksInput({ value, onChange }: { value: LinkItem[]; onChange: (v: LinkItem[]) => void }) {
  const set = (i: number, patch: Partial<LinkItem>) => onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="space-y-2">
      {value.map((l, i) => (
        <div key={i} className="flex gap-2">
          <Input aria-label="Link name" placeholder="Name" value={l.label} onChange={(e) => set(i, { label: e.target.value })} className="w-1/3" />
          <Input aria-label="Link address" placeholder="https://… or mailto:" value={l.url} onChange={(e) => set(i, { url: e.target.value })} />
          <Button type="button" variant="ghost" size="icon" aria-label="Remove link" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="neon" size="sm" onClick={() => onChange([...value, { label: "", url: "" }])}>
        <Plus /> Add link
      </Button>
    </div>
  );
}
