import { useState } from "react";
import { CheckSquare, ChevronDown, ChevronRight, Plus, Settings, Users, Zap } from "lucide-react";
import { OTHER_PROJECT_ID } from "../data";
import type { Project } from "../types";
import type { NavKey } from "../navigation";
import { isSubmitEnter } from "../utils/keyboard";

export function Sidebar({
  projects, activeNav, selectedProjectId, crossTaskCount,
  workspaceName, workspaceLogo, onRenameWorkspace, onEditLogo,
  onSelectNav, onSelectProject, onReorderProjects, onAddProject,
  width, expanded, onToggleExpanded, onResizeStart, resizing,
}: {
  projects: Project[];
  activeNav: NavKey;
  selectedProjectId: string;
  crossTaskCount: number;
  workspaceName: string;
  workspaceLogo: string;
  onRenameWorkspace: (name: string) => void;
  onEditLogo: () => void;
  onSelectNav: (nav: NavKey) => void;
  onSelectProject: (projectId: string) => void;
  onReorderProjects: (sourceId: string, targetId: string) => void;
  onAddProject: () => void;
  width: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
  resizing: boolean;
}) {
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [workspaceDraft, setWorkspaceDraft] = useState("");
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);

  /** 空白のみの入力は保存せず、元の名前を維持する */
  function commitWorkspaceName() {
    const name = workspaceDraft.trim();
    if (name) onRenameWorkspace(name);
    setEditingWorkspace(false);
  }

  const other = projects.find(p => p.id === OTHER_PROJECT_ID);

  function projectButtonClass(projectId: string) {
    const selected = activeNav === "project" && selectedProjectId === projectId;
    return `w-full flex items-center px-2 py-1.5 rounded-md text-[15px] transition-colors ${
      selected ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
    }`;
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-hidden relative"
      style={{
        width: expanded ? width : 56,
        backgroundColor: "var(--sidebar)",
        transition: resizing ? "none" : "width 0.2s",
      }}
    >
      {/* Team Header */}
      {/* 高さ h-[60px] は右のコンテンツヘッダーと揃える必要がある。片方だけ変えないこと */}
      <div className="flex items-center gap-2.5 px-3 h-[60px] flex-shrink-0 border-b border-white/10">
        <button
          onClick={onEditLogo}
          title="ロゴを変更"
          aria-label="ロゴを変更"
          className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
        >
          {workspaceLogo
            ? <img src={workspaceLogo} alt="" className="w-full h-full object-cover" />
            : <Zap size={14} className="text-white" />}
        </button>
        {expanded && (
          <div className="flex-1 min-w-0">
            {editingWorkspace ? (
              <input
                autoFocus
                value={workspaceDraft}
                onChange={e => setWorkspaceDraft(e.target.value)}
                onBlur={commitWorkspaceName}
                onKeyDown={e => {
                  if (isSubmitEnter(e)) commitWorkspaceName();
                  if (e.key === "Escape") setEditingWorkspace(false);
                }}
                className="w-full text-[15px] font-medium text-white bg-white/10 rounded px-1 outline-none border border-white/20 focus:border-primary"
              />
            ) : (
              <div
                onClick={() => { setWorkspaceDraft(workspaceName); setEditingWorkspace(true); }}
                title="クリックして名前を変更"
                className="text-[15px] font-medium text-white truncate cursor-text hover:underline decoration-dotted underline-offset-2"
              >
                {workspaceName}
              </div>
            )}
          </div>
        )}
        <button
          onClick={onToggleExpanded}
          className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <button
          onClick={() => onSelectNav("mytasks")}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[15px] transition-colors ${
            activeNav === "mytasks"
              ? "bg-white/15 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <CheckSquare size={15} className="flex-shrink-0" />
          {expanded && (
            <>
              <span className="flex-1 text-left truncate">全タスク</span>
              {crossTaskCount ? (
                <span className="text-[13px] bg-primary text-white rounded-full px-1.5 py-0.5 font-medium leading-none">
                  {crossTaskCount}
                </span>
              ) : null}
            </>
          )}
        </button>

        {/* Projects Section */}
        <div className="pt-3">
          {expanded && (
            <div className="flex items-center gap-1 px-2 py-1">
              <span className="flex-1 text-[13px] font-medium text-white/40 uppercase tracking-wider">
                プロジェクト
              </span>
              <button
                onClick={onAddProject}
                title="プロジェクトを追加"
                aria-label="プロジェクトを追加"
                className="p-0.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
          <div className="mt-1 space-y-0.5">
            {projects.filter(p => p.id !== OTHER_PROJECT_ID).map(project => (
              <button
                key={project.id}
                draggable={expanded}
                onDragStart={e => {
                  setDraggingProjectId(project.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={e => {
                  // preventDefault しないとドロップが受け付けられない
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (draggingProjectId && draggingProjectId !== project.id) {
                    setDragOverProjectId(project.id);
                  }
                }}
                onDragLeave={() => setDragOverProjectId(cur => (cur === project.id ? null : cur))}
                onDrop={e => {
                  e.preventDefault();
                  if (draggingProjectId) onReorderProjects(draggingProjectId, project.id);
                  setDraggingProjectId(null);
                  setDragOverProjectId(null);
                }}
                onDragEnd={() => { setDraggingProjectId(null); setDragOverProjectId(null); }}
                onClick={() => onSelectProject(project.id)}
                className={`${projectButtonClass(project.id)} ${draggingProjectId === project.id ? "opacity-40" : ""} ${
                  dragOverProjectId === project.id ? "ring-1 ring-white/50" : ""
                }`}
              >
                {expanded && (
                  <>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <span className="flex-1 text-left truncate ml-2" style={{ fontSize: "14px" }}>{project.name}</span>
                  </>
                )}
              </button>
            ))}
            {/* その他案件 — 区切り線の後に固定表示 */}
            {other && (
              <div className="border-t border-white/10 pt-1 mt-1">
                <button onClick={() => onSelectProject(other.id)} className={projectButtonClass(other.id)}>
                  {expanded && (
                    <>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: other.color }} />
                      <span className="flex-1 text-left truncate text-[13px] ml-2">{other.name}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-white/10">
        <button
          onClick={() => onSelectNav("members")}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors ${
            activeNav === "members" ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          <Users size={15} className="flex-shrink-0" />
          {expanded && <span className="text-[13px]">メンバー</span>}
        </button>
        <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors">
          <Settings size={15} className="flex-shrink-0" />
          {expanded && <span className="text-[13px]">設定</span>}
        </button>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 transition-colors group z-20"
      />
    </aside>
  );
}
