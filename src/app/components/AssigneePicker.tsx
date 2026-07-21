import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import type { Member } from "../types";

/**
 * 担当者の表示と付け替え。開閉状態は内部で持ち、外側クリックで閉じる。
 * 一覧では名前つき、ボードのカードではアイコンのみで使う。
 */
export function AssigneePicker({
  members, assigneeId, onChange, showName = false, align = "left",
}: {
  members: Member[];
  assigneeId: string | null;
  onChange: (assigneeId: string | null) => void;
  showName?: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const assignee = members.find(m => m.id === assigneeId);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function select(id: string | null) {
    onChange(id);
    setOpen(false);
  }

  return (
    // overflow-hidden を付けると絶対配置のドロップダウンが切れるので付けない
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted transition-colors"
      >
        {assignee
          ? <Avatar member={assignee} size="sm" showName={showName} />
          : <span className="text-[13px] text-muted-foreground hover:text-foreground">未割り当て</span>}
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1 ${align === "right" ? "right-0" : "left-0"} bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-44`}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => select(null)}
          >
            未割り当て
          </button>
          {members.map(m => (
            <button
              key={m.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
              onClick={() => select(m.id)}
            >
              <Avatar member={m} size="sm" showName />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
