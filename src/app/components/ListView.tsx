import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { AssigneePicker } from "./AssigneePicker";
import { DueDateCell } from "./DueDateCell";
import { EditableTaskName } from "./EditableTaskName";
import { NoteCell } from "./NoteCell";
import { StatusSelect } from "./StatusSelect";
import { COL_W, TASK_NAME_MIN_W, TASK_NAME_PL } from "../constants";
import { isOverdue } from "../utils/date";
import type { Member, Section, Status, Task } from "../types";

export function ListView({
  tasks,
  sections,
  members,
  isOtherProject,
  onUpdateTask,
  onUpdateStatus,
  onAddTask,
  onAddSection,
  onDeleteTask,
  onDeleteSection,
}: {
  tasks: Task[];
  sections: Section[];
  members: Member[];
  /** 「その他案件」ではセクションとタスクを自由に足せる。Web制作プロジェクトはテンプレート固定 */
  isOtherProject: boolean;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onAddTask: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Table header */}
      <div className="flex items-center border-b border-border bg-muted/50 text-[13px] font-medium text-muted-foreground sticky top-0 z-10">
        <div
          className="flex-1 pr-6 py-2 border-r border-border/40"
          style={{ minWidth: TASK_NAME_MIN_W, paddingLeft: TASK_NAME_PL }}
        >
          タスク名
        </div>
        <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
          担当者
        </div>
        <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
          期日
        </div>
        <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
          ステータス
        </div>
        <div className="flex-shrink-0 px-3 py-2 border-r border-border/40" style={{ width: COL_W }}>
          備考
        </div>
      </div>

      {sections.map((section) => {
        const sectionTasks = tasks.filter((t) => t.sectionId === section.id);
        const isCollapsed = collapsed[section.id] === true;
        return (
          <div key={section.id} className="my-[20px]">
            {/* Section header */}
            <div
              className="flex items-center gap-2 px-6 py-2 cursor-pointer hover:bg-muted/30 group"
              onClick={() => setCollapsed((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
            >
              {isCollapsed ? (
                <ChevronRight size={13} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={13} className="text-muted-foreground" />
              )}
              <span className="font-medium text-foreground" style={{ fontSize: "20px" }}>
                {section.name}
              </span>
              {isOtherProject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  title="この案件（セクション）を削除"
                  aria-label="この案件（セクション）を削除"
                  className="ml-1 p-1 rounded text-muted-foreground/40 hover:text-destructive hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {!isCollapsed &&
              sectionTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center border-b border-border/50 hover:bg-card group transition-colors"
                >
                  {/* タスク名。左の px-6 + チェック(13px) + gap-2(8px) で TASK_NAME_PL と同じ字下げになる */}
                  <div
                    className="flex-1 flex items-center gap-2 px-6 py-1.5 border-r border-border/20"
                    style={{ minWidth: TASK_NAME_MIN_W }}
                  >
                    <button
                      onClick={() => onUpdateStatus(task.id, task.status === "done" ? "todo" : "done")}
                      title={task.status === "done" ? "未着手に戻す" : "完了にする"}
                      aria-label={task.status === "done" ? "未着手に戻す" : "完了にする"}
                      className="flex-shrink-0 leading-none"
                    >
                      <CheckCircle2
                        size={13}
                        className={
                          task.status === "done"
                            ? "text-green-500"
                            : "text-muted-foreground/30 hover:text-muted-foreground"
                        }
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <EditableTaskName name={task.name} onChange={(name) => onUpdateTask(task.id, { name })} />
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                    <AssigneePicker
                      members={members}
                      assigneeId={task.assigneeId}
                      onChange={(assigneeId) => onUpdateTask(task.id, { assigneeId })}
                      showName
                    />
                  </div>

                  <div className="flex-shrink-0 px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                    <DueDateCell
                      startDate={task.startDate}
                      endDate={task.endDate}
                      overdue={isOverdue(task.endDate) && task.status !== "done"}
                      onChange={(startDate, endDate) => onUpdateTask(task.id, { startDate, endDate })}
                    />
                  </div>

                  <div
                    className="flex-shrink-0 overflow-hidden px-2 py-1.5 border-r border-border/20"
                    style={{ width: COL_W }}
                  >
                    <StatusSelect status={task.status} onChange={(status) => onUpdateStatus(task.id, status)} />
                  </div>

                  <div
                    className="flex-shrink-0 overflow-hidden px-2 py-1.5"
                    style={{ width: COL_W }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <NoteCell multiline value={task.note} onChange={(note) => onUpdateTask(task.id, { note })} />
                  </div>
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      title="タスクを削除"
                      aria-label="タスクを削除"
                      className="p-1 rounded text-muted-foreground/40 hover:text-destructive hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

            {!isCollapsed && isOtherProject && (
              <button
                onClick={() => onAddTask(section.id)}
                className="flex items-center gap-2 px-6 py-2 text-[13px] text-muted-foreground hover:text-primary transition-colors w-full text-left"
              >
                <Plus size={12} />
                タスクを追加
              </button>
            )}
          </div>
        );
      })}

      {isOtherProject && (
        <div className="px-6 py-3 border-t border-border/50">
          <button
            onClick={onAddSection}
            className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus size={12} />
            案件（セクション）を追加
          </button>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CheckCircle2 size={40} className="mb-3 opacity-30" />
          {isOtherProject ? (
            <>
              <p className="text-[15px] mb-2">案件がありません</p>
              <button onClick={onAddSection} className="text-[13px] text-primary hover:underline">
                ＋ 案件を追加する
              </button>
            </>
          ) : (
            <p className="text-[15px]">タスクがありません</p>
          )}
        </div>
      )}
    </div>
  );
}
