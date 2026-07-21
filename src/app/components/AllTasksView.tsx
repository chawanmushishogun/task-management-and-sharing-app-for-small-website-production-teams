import { useState } from "react";
import { CheckCircle2, MoreHorizontal } from "lucide-react";
import { AssigneePicker } from "./AssigneePicker";
import { Avatar } from "./Avatar";
import { DueDateCell } from "./DueDateCell";
import { EditableTaskName } from "./EditableTaskName";
import { NoteCell } from "./NoteCell";
import { StatusSelect } from "./StatusSelect";
import { COL_W } from "../constants";
import { OTHER_PROJECT_ID } from "../data";
import { isOverdue } from "../utils/date";
import type { Member, Project, Status, Task } from "../types";

/** 全プロジェクト横断の未完了タスク一覧。ログインの概念がないので特定個人には紐づけない */
export function AllTasksView({
  tasks, projects, members, onUpdateTask, onUpdateStatus, onOpenProject,
}: {
  tasks: Task[];
  projects: Project[];
  members: Member[];
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onOpenProject: (projectId: string) => void;
}) {
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all">("all");
  const openTasks = tasks.filter(t => !t.completed);
  const visibleTasks = openTasks.filter(t => assigneeFilter === "all" || t.assigneeId === assigneeFilter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 担当者フィルタ */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border flex-shrink-0 flex-wrap">
        <span className="text-[13px] text-muted-foreground mr-1">担当者</span>
        <button
          onClick={() => setAssigneeFilter("all")}
          className={`text-[13px] px-3 py-1 rounded-md transition-colors ${
            assigneeFilter === "all"
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          すべて
        </button>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => setAssigneeFilter(m.id)}
            className={`flex items-center gap-1.5 text-[13px] pl-1 pr-2.5 py-1 rounded-md transition-colors ${
              assigneeFilter === m.id ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <Avatar member={m} size="sm" />
            <span>{m.name}</span>
            <span className="text-muted-foreground">{openTasks.filter(t => t.assigneeId === m.id).length}</span>
          </button>
        ))}
      </div>

      {/* ヘッダー行 */}
      <div className="flex items-center px-6 py-2 border-b border-border bg-muted/50 text-[13px] font-medium text-muted-foreground sticky top-0 z-10 flex-shrink-0">
        <div className="w-52 flex-shrink-0">プロジェクト</div>
        <div className="flex-1 min-w-0">タスク名</div>
        <div className="flex-shrink-0" style={{ width: COL_W }}>担当者</div>
        <div className="flex-shrink-0" style={{ width: COL_W }}>期日</div>
        <div className="flex-shrink-0" style={{ width: COL_W }}>ステータス</div>
        <div className="flex-shrink-0" style={{ width: COL_W }}>備考</div>
        <div className="w-8 flex-shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {visibleTasks.map(task => {
          const project = projects.find(p => p.id === task.projectId);
          return (
            <div
              key={task.id}
              onClick={() => onOpenProject(task.projectId)}
              className="flex items-center px-6 py-1.5 border-b border-border/50 hover:bg-card cursor-pointer group transition-colors"
            >
              <div className="w-52 flex-shrink-0 pr-3">
                {project && (
                  <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground truncate">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    {/* 「その他案件」はプロジェクト名が共通なのでセクション名のほうが手がかりになる */}
                    {project.id === OTHER_PROJECT_ID ? task.section : project.name}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <EditableTaskName name={task.name} onChange={name => onUpdateTask(task.id, { name })} />
              </div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                <AssigneePicker
                  members={members}
                  assigneeId={task.assigneeId}
                  onChange={assigneeId => onUpdateTask(task.id, { assigneeId })}
                  showName
                />
              </div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                <DueDateCell
                  startDate={task.startDate}
                  endDate={task.endDate}
                  overdue={isOverdue(task.endDate) && !task.completed}
                  onChange={(startDate, endDate) => onUpdateTask(task.id, { startDate, endDate })}
                />
              </div>
              <div className="flex-shrink-0 overflow-hidden" style={{ width: COL_W }}>
                <StatusSelect status={task.status} onChange={status => onUpdateStatus(task.id, status)} />
              </div>
              <div className="flex-shrink-0 overflow-hidden" style={{ width: COL_W }} onClick={e => e.stopPropagation()}>
                <NoteCell value={task.note} onChange={note => onUpdateTask(task.id, { note })} />
              </div>
              <div className="w-8 flex justify-end flex-shrink-0">
                <button
                  onClick={e => e.stopPropagation()}
                  className="p-1 rounded text-transparent group-hover:text-muted-foreground hover:bg-muted transition-colors"
                >
                  <MoreHorizontal size={13} />
                </button>
              </div>
            </div>
          );
        })}
        {visibleTasks.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-[15px]">
              {assigneeFilter === "all" ? "未完了のタスクはありません" : "この担当者の未完了タスクはありません"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
