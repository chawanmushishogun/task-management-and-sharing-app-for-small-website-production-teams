import type { ReactNode } from "react";
import { X } from "lucide-react";

/** 全モーダル共通の枠。背景クリックと × で閉じる */
export function Modal({
  title, onClose, children, width = "max-w-md", padding = "p-5",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
  padding?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className={`bg-card rounded-xl border border-border shadow-xl w-full ${width} ${padding}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
