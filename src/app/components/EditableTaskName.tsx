import { useState } from "react";
import { isSubmitEnter } from "../utils/keyboard";

/** クリックでインライン編集に切り替わるタスク名。Enter か blur で確定する */
export function EditableTaskName({ name, onChange }: { name: string; onChange: (name: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);

  if (draft === null) {
    return (
      <span
        className="text-foreground hover:underline decoration-dotted underline-offset-2 cursor-text font-medium"
        style={{ fontSize: "15px" }}
        onClick={e => { e.stopPropagation(); setDraft(name); }}
      >
        {name}
      </span>
    );
  }

  const commit = () => { onChange(draft); setDraft(null); };
  return (
    <input
      autoFocus
      className="w-full text-foreground bg-transparent outline-none border-b border-primary font-medium"
      style={{ fontSize: "15px" }}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (isSubmitEnter(e)) commit(); e.stopPropagation(); }}
      onClick={e => e.stopPropagation()}
    />
  );
}
