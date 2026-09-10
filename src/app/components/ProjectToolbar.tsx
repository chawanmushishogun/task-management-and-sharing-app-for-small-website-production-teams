import { Columns, List } from "lucide-react";
import { STATUS_CONFIG } from "../data";
import type { Status } from "../types";
import type { ProjectView } from "../navigation";

/** 案件画面のツールバー。リスト／ボードの切替とステータスの絞り込み */
export function ProjectToolbar({
  view,
  onChangeView,
  filterStatus,
  onChangeFilter,
}: {
  view: ProjectView;
  onChangeView: (view: ProjectView) => void;
  filterStatus: Status | "all";
  onChangeFilter: (status: Status | "all") => void;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-2.5 bg-card border-b border-border flex-shrink-0">
      <div className="flex items-center rounded-md border border-border overflow-hidden">
        {(
          [
            { key: "list", label: "リスト", Icon: List },
            { key: "board", label: "ボード", Icon: Columns },
          ] as const
        ).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onChangeView(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${
              view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {(["all", "todo", "in_progress", "done"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onChangeFilter(s)}
            className={`text-[13px] px-2 py-1 rounded-md font-medium transition-colors ${
              filterStatus === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {s === "all" ? "すべて" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
    </div>
  );
}
