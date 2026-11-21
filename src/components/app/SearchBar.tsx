import { Mic, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SpeechCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
};

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [voice, setVoice] = useState<SpeechCtor | null>(null);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    setVoice(() => w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null);
  }, []);

  const startVoice = () => {
    if (!voice) return;
    try {
      const rec = new voice();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.onresult = (e) => {
        const text = e.results[0]?.[0]?.transcript ?? "";
        onChange(text);
      };
      rec.onerror = () => toast.error("Voice search didn't catch that. Try again.");
      rec.onend = () => setListening(false);
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-3">
      <label className="flex items-center gap-3 rounded-2xl neon-border bg-background/70 px-4 py-3">
        <Search className="size-5 shrink-0 text-neon" aria-hidden />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="SEARCH APP..."
          aria-label="Search apps, websites or categories"
          className="min-w-0 flex-1 bg-transparent font-display text-sm font-semibold tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none"
          type="search"
          enterKeyHint="search"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
        {voice && (
          <button
            type="button"
            onClick={startVoice}
            aria-label="Search by voice"
            className={listening ? "rounded-full p-1 text-vip animate-pulse" : "rounded-full p-1 text-muted-foreground hover:text-neon"}
          >
            <Mic className="size-4" />
          </button>
        )}
      </label>
    </div>
  );
}
