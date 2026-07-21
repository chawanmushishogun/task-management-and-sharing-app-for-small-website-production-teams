import { useState } from "react";
import { Plus } from "lucide-react";
import { AssigneePicker } from "./AssigneePicker";
import { DueDateCell } from "./DueDateCell";
import { BOARD_COLUMNS } from "../data";
import { isOverdue } from "../utils/date";
import type { Member, Status, Task } from "../types";

export function BoardView({
  tasks, members, isOtherProject, onUpdateTask, onUpdateStatus, onAddTask,
}: {
  tasks: Task[];
  members: Member[];
  isOtherProject: boolean;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onAddTask: (section: string) => void;
}) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  return (
    <div className="flex-1 overflow-auto">
      {/* 列ごとにスクロールさせるとカード内のドロップダウンが切れるので、ボード全体を1つのスクロール領域にする。
          items-stretch(既定)で全列が最も高い列に揃い、ドロップ可能な範囲もそこまで広がる */}
      <div className="flex gap-4 p-6 min-w-max">
        {BOARD_COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={e => {
                if (!draggingTaskId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOverColumn(col.key);
              }}
              onDragLeave={() => setDragOverColumn(cur => (cur === col.key ? null : cur))}
              onDrop={e => {
                e.preventDefault();
                if (draggingTaskId) onUpdateStatus(draggingTaskId, col.key);
                setDraggingTaskId(null);
                setDragOverColumn(null);
              }}
              className={`flex flex-col w-64 flex-shrink-0 min-h-[140px] rounded-xl bg-muted/40 p-2 transition-colors ${
                dragOverColumn === col.key ? "bg-primary/10 ring-1 ring-primary/40" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-3 px-1 pt-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-[13px] font-medium text-foreground">{col.label}</span>
                <span className="text-[13px] text-muted-foreground ml-auto">{colTasks.length}</span>
              </div>
              <div className="space-y-2 pb-2">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={e => {
                      setDraggingTaskId(task.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => { setDraggingTaskId(null); setDragOverColumn(null); }}
                    className={`relative bg-card rounded-lg p-3 border border-border hover:border-primary/30 hover:shadow-sm transition-all group ${
                      draggingTaskId === task.id ? "opacity-40" : ""
                    }`}
                  >
                    {/* どの工程のタスクかはボードでは失われるのでカードに出す */}
                    <div className="text-[11px] text-muted-foreground mb-1 truncate">{task.section}</div>
                    <div className="flex items-start mb-2">
                      <span className="text-[13px] font-medium leading-snug flex-1 text-foreground">{task.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <DueDateCell
                        startDate={task.startDate}
                        endDate={task.endDate}
                        overdue={isOverdue(task.endDate) && !task.completed}
                        onChange={(startDate, endDate) => onUpdateTask(task.id, { startDate, endDate })}
                      />
                      <div className="flex-shrink-0">
                        <AssigneePicker
                          members={members}
                          assigneeId={task.assigneeId}
                          onChange={assigneeId => onUpdateTask(task.id, { assigneeId })}
                          align="right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {isOtherProject && (
                  <button
                    onClick={() => onAddTask(col.label)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-[13px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    <Plus size={12} />追加
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
