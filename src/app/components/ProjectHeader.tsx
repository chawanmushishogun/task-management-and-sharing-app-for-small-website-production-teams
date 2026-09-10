import { useState } from "react";
import { Trash2 } from "lucide-react";
import { isSubmitEnter } from "../utils/keyboard";
import type { Project } from "../types";

/** 案件画面のヘッダー。案件名のクリック編集、未完了件数、削除ボタン */
export function ProjectHeader({
  project,
  openCount,
  onRename,
  onDelete,
}: {
  project: Project;
  openCount: number;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  /** 空白のみの入力は保存せず、元の名前を維持する */
  function commit() {
    const name = draft.trim();
    if (name) onRename(name);
    setEditing(false);
  }

  return (
    <>
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (isSubmitEnter(e)) commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="font-medium text-foreground bg-transparent outline-none border-b border-primary"
          style={{ fontSize: "24px" }}
        />
      ) : (
        <h1
          onClick={() => {
            setDraft(project.name);
            setEditing(true);
          }}
          title="クリックして名前を変更"
          className="font-medium text-foreground cursor-text hover:underline decoration-dotted underline-offset-4"
          style={{ fontSize: "24px" }}
        >
          {project.name}
        </h1>
      )}
      <span className="text-[13px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{openCount}件</span>
      {!project.isOther && (
        <button
          onClick={onDelete}
          title="この案件を削除"
          className="ml-2 flex items-center gap-1 text-[12px] text-muted-foreground hover:text-destructive px-2 py-1 rounded-md hover:bg-muted transition-colors"
        >
          <Trash2 size={12} />
          案件を削除
        </button>
      )}
    </>
  );
}
