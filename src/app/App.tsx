import { useState, useRef } from "react";
import {
  CheckSquare, ChevronDown, ChevronRight,
  Plus, Settings, MoreHorizontal, X,
  List, Columns,
  CheckCircle2,
  Zap, Calendar, Users
} from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Member, Project, Status, Task } from "./types";
import {
  BOARD_COLUMNS, INITIAL_TASKS, MEMBERS, OTHER_PROJECT_ID,
  PROJECT_COLORS, PROJECTS, STATUS_CONFIG, WEB_TEMPLATE,
} from "./data";
import { Avatar } from "./components/Avatar";
import { ImageDropZone } from "./components/ImageDropZone";
import { DateRangePicker } from "./components/DateRangePicker";
import { formatDateRange, isOverdue } from "./utils/date";

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", INITIAL_TASKS);
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("p1");
  const [view, setView] = useState<"list" | "board">("list");
  const [activeNav, setActiveNav] = useState<"mytasks" | "project" | "members">("project");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  function onResizeStart(e: React.MouseEvent) {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = ev.clientX - startX.current;
      const next = Math.min(400, Math.max(160, startWidth.current + delta));
      setSidebarWidth(next);
      setSidebarExpanded(next > 120);
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskSection, setNewTaskSection] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [members, setMembers] = useLocalStorage<Member[]>("members", MEMBERS);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<Omit<Member, "id">>({ name: "", initials: "", color: "#3b82f6", role: "", avatarUrl: "" });
  const [editingTaskName, setEditingTaskName] = useState<{ id: string; value: string } | null>(null);
  const COL_W = 160;
  // タスク名列がこれ以上縮まないようにする下限。ヘッダーと行の両方に同じ値を適用すること
  const TASK_NAME_MIN_W = 400;
  // セクション名の左端に合わせるための字下げ: px-6(24px) + 矢印(13px) + gap-2(8px)
  const TASK_NAME_PL = 45;
  const [openAssignee, setOpenAssignee] = useState<string | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showNewProject, setShowNewProject] = useState(false);
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useLocalStorage<string>("workspaceName", "Acme Corp");
  const [workspaceLogo, setWorkspaceLogo] = useLocalStorage<string>("workspaceLogo", "");
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState("");
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [workspaceDraft, setWorkspaceDraft] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all">("all");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const currentProject = projects.find(p => p.id === selectedProjectId);

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const filteredTasks = projectTasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  const sections = [...new Set(filteredTasks.map(t => t.section))];

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  function updateTaskStatus(id: string, status: Status) {
    updateTask(id, { status, completed: status === "done" });
  }

  /** サイドバーのプロジェクトを並び替える。「その他案件」は対象外で常に末尾に残す。 */
  function reorderProjects(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    setProjects(prev => {
      const others = prev.filter(p => p.id === OTHER_PROJECT_ID);
      const list = prev.filter(p => p.id !== OTHER_PROJECT_ID);
      const from = list.findIndex(p => p.id === sourceId);
      const to = list.findIndex(p => p.id === targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return [...next, ...others];
    });
  }

  function addWebProject() {
    if (!newProjectName.trim()) return;
    const id = `p${Date.now()}`;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    const newProject: Project = {
      id,
      name: newProjectName.trim(),
      color,
      starred: false,
      taskCount: WEB_TEMPLATE.reduce((acc, s) => acc + s.tasks.length, 0),
      completedCount: 0,
    };
    const newTasks: Task[] = WEB_TEMPLATE.flatMap(s =>
      s.tasks.map(name => ({
        id: `t${Date.now()}_${Math.random().toString(36).slice(2)}`,
        projectId: id,
        name,
        assigneeId: null,
        startDate: null,
      endDate: null,
        status: "todo" as Status,
        description: "",
        completed: false,
        tags: [],
        section: s.section,
        subtasks: [],
        comments: [],
        note: "",
      }))
    );
    setProjects(prev => {
      const others = prev.filter(p => p.id !== OTHER_PROJECT_ID);
      const other = prev.find(p => p.id === OTHER_PROJECT_ID)!;
      return [...others, newProject, other];
    });
    setTasks(prev => [...prev, ...newTasks]);
    setSelectedProjectId(id);
    setActiveNav("project");
    setNewProjectName("");
    setShowNewProject(false);
  }

  function addOtherSection() {
    if (!newSectionName.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      projectId: OTHER_PROJECT_ID,
      name: "タスクを追加",
      assigneeId: null,
      startDate: null,
      endDate: null,
      status: "todo",
      description: "",
      completed: false,
      tags: [],
      section: newSectionName.trim(),
      subtasks: [],
      comments: [],
      note: "",
    };
    setTasks(prev => [...prev, task]);
    setNewSectionName("");
    setShowAddSection(false);
  }

  function addTask() {
    if (!newTaskName.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      projectId: selectedProjectId,
      name: newTaskName.trim(),
      assigneeId: null,
      startDate: null,
      endDate: null,

      status: "todo",
      description: "",
      completed: false,
      tags: [],
      section: newTaskSection || (sections[0] ?? "その他"),
      subtasks: [],
      comments: [],
      note: "",
    };
    setTasks(prev => [...prev, task]);
    setNewTaskName("");
    setShowAddTask(false);
  }

  /** 空白のみの入力は保存せず、元の名前を維持する */
  function commitProjectName(projectId: string) {
    const name = projectDraft.trim();
    if (name) setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, name } : p)));
    setEditingProject(false);
  }

  /** 空白のみの入力は保存せず、元の名前を維持する */
  function commitWorkspaceName() {
    const name = workspaceDraft.trim();
    if (name) setWorkspaceName(name);
    setEditingWorkspace(false);
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  // 全プロジェクト横断の未完了タスク。ログインの概念がないので特定個人には紐づけない
  const crossTasks = tasks.filter(t =>
    (assigneeFilter === "all" || t.assigneeId === assigneeFilter) && !t.completed
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-hidden relative"
        style={{ width: sidebarExpanded ? sidebarWidth : 56, backgroundColor: "var(--sidebar)", transition: isResizing.current ? "none" : "width 0.2s" }}
      >
        {/* Team Header */}
        {/* 高さ h-[60px] は右のコンテンツヘッダーと揃える必要がある。片方だけ変えないこと */}
        <div className="flex items-center gap-2.5 px-3 h-[60px] flex-shrink-0 border-b border-white/10">
          <button
            onClick={() => setShowLogoEditor(true)}
            title="ロゴを変更"
            aria-label="ロゴを変更"
            className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
          >
            {workspaceLogo
              ? <img src={workspaceLogo} alt="" className="w-full h-full object-cover" />
              : <Zap size={14} className="text-white" />}
          </button>
          {sidebarExpanded && (
            <div className="flex-1 min-w-0">
              {editingWorkspace ? (
                <input
                  autoFocus
                  value={workspaceDraft}
                  onChange={e => setWorkspaceDraft(e.target.value)}
                  onBlur={commitWorkspaceName}
                  onKeyDown={e => {
                    if (e.key === "Enter") commitWorkspaceName();
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
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {sidebarExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>


        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {[
            { key: "mytasks" as const, icon: CheckSquare, label: "全タスク", badge: crossTasks.length },
            ].map(({ key, icon: Icon, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[15px] transition-colors ${
                activeNav === key
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              {sidebarExpanded && (
                <>
                  <span className="flex-1 text-left truncate">{label}</span>
                  {badge ? (
                    <span className="text-[13px] bg-primary text-white rounded-full px-1.5 py-0.5 font-medium leading-none">
                      {badge}
                    </span>
                  ) : null}
                </>
              )}
            </button>
          ))}

          {/* Projects Section */}
          <div className="pt-3">
            {sidebarExpanded && (
              <div className="flex items-center gap-1 px-2 py-1">
                <span className="flex-1 text-[13px] font-medium text-white/40 uppercase tracking-wider">
                  プロジェクト
                </span>
                <button
                  onClick={() => setShowNewProject(true)}
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
                  draggable={sidebarExpanded}
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
                    if (draggingProjectId) reorderProjects(draggingProjectId, project.id);
                    setDraggingProjectId(null);
                    setDragOverProjectId(null);
                  }}
                  onDragEnd={() => { setDraggingProjectId(null); setDragOverProjectId(null); }}
                  onClick={() => { setSelectedProjectId(project.id); setActiveNav("project"); setEditingProject(false); }}
                  className={`w-full flex items-center px-2 py-1.5 rounded-md text-[15px] transition-colors ${
                    activeNav === "project" && selectedProjectId === project.id
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  } ${draggingProjectId === project.id ? "opacity-40" : ""} ${
                    dragOverProjectId === project.id ? "ring-1 ring-white/50" : ""
                  }`}
                >
                  {sidebarExpanded && (
                    <>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                      <span className="flex-1 text-left truncate ml-2" style={{ fontSize: "14px" }}>{project.name}</span>
                    </>
                  )}
                </button>
              ))}
              {/* その他案件 — 区切り線の後に固定表示 */}
              <div className="border-t border-white/10 pt-1 mt-1">
                {(() => {
                  const other = projects.find(p => p.id === OTHER_PROJECT_ID)!;
                  return (
                    <button
                      onClick={() => { setSelectedProjectId(OTHER_PROJECT_ID); setActiveNav("project"); setEditingProject(false); }}
                      className={`w-full flex items-center px-2 py-1.5 rounded-md text-[15px] transition-colors ${
                        activeNav === "project" && selectedProjectId === OTHER_PROJECT_ID
                          ? "bg-white/15 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {sidebarExpanded && (
                        <>
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: other.color }} />
                          <span className="flex-1 text-left truncate text-[13px] ml-2">{other.name}</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-2 py-2 border-t border-white/10">
          <button
            onClick={() => setActiveNav("members")}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors ${activeNav === "members" ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}
          >
            <Users size={15} className="flex-shrink-0" />
            {sidebarExpanded && <span className="text-[13px]">メンバー</span>}
          </button>
          <button className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors`}>
            <Settings size={15} className="flex-shrink-0" />
            {sidebarExpanded && <span className="text-[13px]">設定</span>}
          </button>
        </div>
        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 transition-colors group z-20"
        />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        {/* 高さ h-[60px] は左のサイドバーヘッダーと揃える必要がある。片方だけ変えないこと */}
        <header className="flex items-center justify-between px-6 h-[60px] bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeNav === "project" && currentProject && (
              <>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentProject.color }} />
                {editingProject ? (
                  <input
                    autoFocus
                    value={projectDraft}
                    onChange={e => setProjectDraft(e.target.value)}
                    onBlur={() => commitProjectName(currentProject.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter") commitProjectName(currentProject.id);
                      if (e.key === "Escape") setEditingProject(false);
                    }}
                    className="font-medium text-foreground bg-transparent outline-none border-b border-primary"
                    style={{ fontSize: "24px" }}
                  />
                ) : (
                  <h1
                    onClick={() => { setProjectDraft(currentProject.name); setEditingProject(true); }}
                    title="クリックして名前を変更"
                    className="font-medium text-foreground cursor-text hover:underline decoration-dotted underline-offset-4"
                    style={{ fontSize: "24px" }}
                  >
                    {currentProject.name}
                  </h1>
                )}
                <span className="text-[13px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {projectTasks.filter(t => !t.completed).length}件
                </span>
              </>
            )}
            {activeNav === "mytasks" && <h1 className="font-medium text-foreground" style={{ fontSize: "24px" }}>全タスク</h1>}
            {activeNav === "members" && <h1 className="font-medium text-foreground" style={{ fontSize: "24px" }}>メンバー</h1>}
          </div>
        </header>

        {/* Project content */}
        {activeNav === "project" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-6 py-2.5 bg-card border-b border-border flex-shrink-0">
                <div className="flex items-center rounded-md border border-border overflow-hidden">
                  <button
                    onClick={() => setView("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <List size={12} />リスト
                  </button>
                  <button
                    onClick={() => setView("board")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${view === "board" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <Columns size={12} />ボード
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {(["all", "todo", "in_progress", "done"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`text-[13px] px-2 py-1 rounded-md font-medium transition-colors ${
                        filterStatus === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s === "all" ? "すべて" : STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List View */}
              {view === "list" && (
                <div className="flex-1 overflow-y-auto">
                  {/* Table header */}
                  <div className="flex items-center border-b border-border bg-muted/50 text-[13px] font-medium text-muted-foreground sticky top-0 z-10">
                    <div className="flex-1 pr-6 py-2 border-r border-border/40" style={{ minWidth: TASK_NAME_MIN_W, paddingLeft: TASK_NAME_PL }}>タスク名</div>
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
                    <div className="w-8 flex-shrink-0" />
                  </div>

                  {sections.map(section => {
                    const sectionTasks = filteredTasks.filter(t => t.section === section);
                    const isCollapsed = expandedSections[section] === false;
                    return (
                      <div key={section} className="my-[20px]">
                        {/* Section header */}
                        <div
                          className="flex items-center gap-2 px-6 py-2 cursor-pointer hover:bg-muted/30 group"
                          onClick={() => toggleSection(section)}
                        >
                          {isCollapsed ? <ChevronRight size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
                          <span className="font-medium text-foreground" style={{ fontSize: "20px" }}>{section}</span>
                        </div>

                        {!isCollapsed && sectionTasks.map(task => {
                          const assignee = members.find(m => m.id === task.assigneeId);
                          const overdue = isOverdue(task.endDate) && !task.completed;
                          const isEditingName = editingTaskName?.id === task.id;
                          return (
                            <div
                              key={task.id}
                              className="flex items-center border-b border-border/50 hover:bg-card group transition-colors"
                            >
                              {/* タスク名。左の px-6 + チェック(13px) + gap-2(8px) で TASK_NAME_PL と同じ字下げになる */}
                              <div className="flex-1 flex items-center gap-2 px-6 py-1.5 border-r border-border/20" style={{ minWidth: TASK_NAME_MIN_W }}>
                                <button
                                  onClick={() => updateTaskStatus(task.id, task.status === "done" ? "todo" : "done")}
                                  title={task.status === "done" ? "未着手に戻す" : "完了にする"}
                                  aria-label={task.status === "done" ? "未着手に戻す" : "完了にする"}
                                  className="flex-shrink-0 leading-none"
                                >
                                  <CheckCircle2
                                    size={13}
                                    className={task.status === "done"
                                      ? "text-green-500"
                                      : "text-muted-foreground/30 hover:text-muted-foreground"}
                                  />
                                </button>
                                <div className="flex-1 min-w-0">
                                {isEditingName ? (
                                  <input
                                    autoFocus
                                    className="w-full text-foreground bg-transparent outline-none border-b border-primary" style={{ fontSize: "15px" }}
                                    value={editingTaskName.value}
                                    onChange={e => setEditingTaskName({ id: task.id, value: e.target.value })}
                                    onBlur={() => { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); }}
                                    onKeyDown={e => { if (e.key === "Enter") { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); } e.stopPropagation(); }}
                                    onClick={e => e.stopPropagation()}
                                  />
                                ) : (
                                  <span
                                    className="text-foreground hover:underline decoration-dotted underline-offset-2 cursor-text font-medium" style={{ fontSize: "15px" }}
                                    onClick={e => { e.stopPropagation(); setEditingTaskName({ id: task.id, value: task.name }); }}
                                  >
                                    {task.name}
                                  </span>
                                )}
                                </div>
                              </div>

                              {/* 担当者 */}
                              {/* overflow-hidden を付けると絶対配置のドロップダウンが切れるので付けない */}
                              <div className="flex flex-shrink-0 relative px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                                <button
                                  onClick={e => { e.stopPropagation(); setOpenAssignee(openAssignee === task.id ? null : task.id); }}
                                  className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted transition-colors"
                                >
                                  {assignee
                                    ? <Avatar member={assignee} size="sm" showName />
                                    : <span className="text-[13px] text-muted-foreground hover:text-foreground">未割り当て</span>}
                                </button>
                                {openAssignee === task.id && (
                                  <div
                                    className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-44"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <button
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted transition-colors"
                                      onClick={() => { updateTask(task.id, { assigneeId: null }); setOpenAssignee(null); }}
                                    >
                                      未割り当て
                                    </button>
                                    {members.map(m => (
                                      <button
                                        key={m.id}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
                                        onClick={() => { updateTask(task.id, { assigneeId: m.id }); setOpenAssignee(null); }}
                                      >
                                        <Avatar member={m} size="sm" showName />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 期日 */}
                              <div className="flex-shrink-0 relative px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                                <button
                                  onClick={e => { e.stopPropagation(); setOpenDatePicker(openDatePicker === task.id ? null : task.id); }}
                                  className={`flex items-center gap-1 text-[13px] px-2 py-0.5 rounded hover:bg-muted transition-colors ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                                >
                                  <Calendar size={10} className="flex-shrink-0" />
                                  {formatDateRange(task.startDate, task.endDate)}
                                </button>
                                {openDatePicker === task.id && (
                                  <DateRangePicker
                                    startDate={task.startDate}
                                    endDate={task.endDate}
                                    onChange={(s, e) => updateTask(task.id, { startDate: s, endDate: e })}
                                    onClose={() => setOpenDatePicker(null)}
                                  />
                                )}
                              </div>

                              {/* ステータス */}
                              <div className="flex-shrink-0 overflow-hidden px-2 py-1.5 border-r border-border/20" style={{ width: COL_W }}>
                                <select
                                  value={task.status}
                                  onChange={e => { e.stopPropagation(); updateTaskStatus(task.id, e.target.value as Status); }}
                                  onClick={e => e.stopPropagation()}
                                  className={`text-[13px] px-1.5 py-0.5 rounded-full border font-medium cursor-pointer outline-none appearance-none ${STATUS_CONFIG[task.status].color} ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].border}`}
                                >
                                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                  ))}
                                </select>
                              </div>
                              {/* 備考 */}
                              <div className="flex-shrink-0 overflow-hidden px-2 py-1.5" style={{ width: COL_W }} onClick={e => e.stopPropagation()}>
                                <textarea
                                  rows={1}
                                  value={task.note}
                                  onChange={e => updateTask(task.id, { note: e.target.value })}
                                  onClick={e => e.stopPropagation()}
                                  // 中身に合わせて高さを追従させる（毎レンダー実行される）
                                  ref={el => {
                                    if (el) {
                                      el.style.height = "auto";
                                      el.style.height = `${el.scrollHeight}px`;
                                    }
                                  }}
                                  placeholder="メモを入力..."
                                  className="w-full resize-none overflow-hidden block text-[13px] leading-snug px-2 py-0.5 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent focus:bg-card transition-colors placeholder-muted-foreground/50"
                                />
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

                        {/* Add task in section — その他案件のみ。Web制作プロジェクトはテンプレート固定 */}
                        {!isCollapsed && selectedProjectId === OTHER_PROJECT_ID && (
                          <button
                            onClick={() => { setNewTaskSection(section); setShowAddTask(true); }}
                            className="flex items-center gap-2 px-6 py-2 text-[13px] text-muted-foreground hover:text-primary transition-colors w-full text-left"
                          >
                            <Plus size={12} />タスクを追加
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* その他案件：案件（セクション）追加ボタン */}
                  {selectedProjectId === OTHER_PROJECT_ID && (
                    <div className="px-6 py-3 border-t border-border/50">
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus size={12} />案件（セクション）を追加
                      </button>
                    </div>
                  )}

                  {filteredTasks.length === 0 && selectedProjectId !== OTHER_PROJECT_ID && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <CheckCircle2 size={40} className="mb-3 opacity-30" />
                      <p className="text-[15px]">タスクがありません</p>
                    </div>
                  )}

                  {filteredTasks.length === 0 && selectedProjectId === OTHER_PROJECT_ID && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <CheckCircle2 size={40} className="mb-3 opacity-30" />
                      <p className="text-[15px] mb-2">案件がありません</p>
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="text-[13px] text-primary hover:underline"
                      >
                        ＋ 案件を追加する
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Board View */}
              {view === "board" && (
                <div className="flex-1 overflow-auto">
                  {/* 列ごとにスクロールさせるとカード内のドロップダウンが切れるので、ボード全体を1つのスクロール領域にする。
                      items-stretch(既定)で全列が最も高い列に揃い、ドロップ可能な範囲もそこまで広がる */}
                  <div className="flex gap-4 p-6 min-w-max">
                    {BOARD_COLUMNS.map(col => {
                      const colTasks = filteredTasks.filter(t => t.status === col.key);
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
                            if (draggingTaskId) updateTaskStatus(draggingTaskId, col.key);
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
                            {colTasks.map(task => {
                              const assignee = members.find(m => m.id === task.assigneeId);
                              const overdue = isOverdue(task.endDate) && !task.completed;
                              return (
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
                                    <span className="text-[13px] font-medium leading-snug flex-1 text-foreground">
                                      {task.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-1">
                                    {/* 期日 */}
                                    <div className="relative">
                                      <button
                                        onClick={() => setOpenDatePicker(openDatePicker === task.id + "_board" ? null : task.id + "_board")}
                                        className={`flex items-center gap-1 text-[13px] px-1 py-0.5 rounded hover:bg-muted transition-colors ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                                      >
                                        <Calendar size={10} className="flex-shrink-0" />
                                        {formatDateRange(task.startDate, task.endDate)}
                                      </button>
                                      {openDatePicker === task.id + "_board" && (
                                        <DateRangePicker
                                          startDate={task.startDate}
                                          endDate={task.endDate}
                                          onChange={(s, e) => updateTask(task.id, { startDate: s, endDate: e })}
                                          onClose={() => setOpenDatePicker(null)}
                                        />
                                      )}
                                    </div>
                                    {/* 担当者 */}
                                    <div className="relative flex-shrink-0">
                                      <button
                                        onClick={() => setOpenAssignee(openAssignee === task.id + "_board" ? null : task.id + "_board")}
                                        className="flex items-center rounded hover:bg-muted transition-colors p-0.5"
                                      >
                                        {assignee
                                          ? <Avatar member={assignee} size="sm" />
                                          : <span className="text-[13px] text-muted-foreground hover:text-foreground px-1">未割り当て</span>}
                                      </button>
                                      {openAssignee === task.id + "_board" && (
                                        <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-44">
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted transition-colors"
                                            onClick={() => { updateTask(task.id, { assigneeId: null }); setOpenAssignee(null); }}
                                          >
                                            未割り当て
                                          </button>
                                          {members.map(m => (
                                            <button
                                              key={m.id}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
                                              onClick={() => { updateTask(task.id, { assigneeId: m.id }); setOpenAssignee(null); }}
                                            >
                                              <Avatar member={m} size="sm" showName />
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {selectedProjectId === OTHER_PROJECT_ID && (
                              <button
                                onClick={() => { setNewTaskSection(col.label); setShowAddTask(true); }}
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
              )}
            </div>

          </div>
        )}


        {/* 全タスク（全プロジェクト横断） */}
        {activeNav === "mytasks" && (
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
              {members.map(m => {
                const count = tasks.filter(t => t.assigneeId === m.id && !t.completed).length;
                return (
                  <button
                    key={m.id}
                    onClick={() => setAssigneeFilter(m.id)}
                    className={`flex items-center gap-1.5 text-[13px] pl-1 pr-2.5 py-1 rounded-md transition-colors ${
                      assigneeFilter === m.id ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Avatar member={m} size="sm" />
                    <span>{m.name}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>
            {/* ヘッダー行 */}
            <div className="flex items-center px-6 py-2 border-b border-border bg-muted/50 text-[13px] font-medium text-muted-foreground sticky top-0 z-10 flex-shrink-0">
              <div className="w-52 flex-shrink-0">プロジェクト</div>
              <div className="flex-1 min-w-0">タスク名</div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                担当者
              </div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                期日
              </div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                ステータス
              </div>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                備考
              </div>
              <div className="w-8 flex-shrink-0" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {crossTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId);
                const overdue = isOverdue(task.endDate) && !task.completed;
                const isEditingName = editingTaskName?.id === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedProjectId(task.projectId); setActiveNav("project"); }}
                    className="flex items-center px-6 py-1.5 border-b border-border/50 hover:bg-card cursor-pointer group transition-colors"
                  >
                    {/* プロジェクト */}
                    <div className="w-52 flex-shrink-0 pr-3">
                      {project && (
                        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground truncate">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                          {project.id === OTHER_PROJECT_ID ? task.section : project.name}
                        </span>
                      )}
                    </div>
                    {/* タスク名 */}
                    <div className="flex-1 min-w-0 pr-2">
                      {isEditingName ? (
                        <input
                          autoFocus
                          className="w-full text-foreground bg-transparent outline-none border-b border-primary font-medium" style={{ fontSize: "15px" }}
                          value={editingTaskName.value}
                          onChange={e => setEditingTaskName({ id: task.id, value: e.target.value })}
                          onBlur={() => { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); }}
                          onKeyDown={e => { if (e.key === "Enter") { updateTask(task.id, { name: editingTaskName.value }); setEditingTaskName(null); } e.stopPropagation(); }}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="text-foreground hover:underline decoration-dotted underline-offset-2 cursor-text font-medium" style={{ fontSize: "15px" }}
                          onClick={e => { e.stopPropagation(); setEditingTaskName({ id: task.id, value: task.name }); }}
                        >
                          {task.name}
                        </span>
                      )}
                    </div>
                    {/* 担当者 */}
                    <div className="flex-shrink-0 relative" style={{ width: COL_W }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenAssignee(openAssignee === task.id + "_all" ? null : task.id + "_all")}
                        className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted transition-colors"
                      >
                        {(() => {
                          const a = members.find(m => m.id === task.assigneeId);
                          return a
                            ? <Avatar member={a} size="sm" showName />
                            : <span className="text-[13px] text-muted-foreground hover:text-foreground">未割り当て</span>;
                        })()}
                      </button>
                      {openAssignee === task.id + "_all" && (
                        <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-44">
                          <button
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted transition-colors"
                            onClick={() => { updateTask(task.id, { assigneeId: null }); setOpenAssignee(null); }}
                          >
                            未割り当て
                          </button>
                          {members.map(m => (
                            <button
                              key={m.id}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
                              onClick={() => { updateTask(task.id, { assigneeId: m.id }); setOpenAssignee(null); }}
                            >
                              <Avatar member={m} size="sm" showName />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* 期日 */}
                    <div className="flex-shrink-0 relative" style={{ width: COL_W }}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenDatePicker(openDatePicker === task.id ? null : task.id); }}
                        className={`flex items-center gap-1 text-[13px] px-2 py-0.5 rounded hover:bg-muted transition-colors ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                      >
                        <Calendar size={10} className="flex-shrink-0" />
                        {formatDateRange(task.startDate, task.endDate)}
                      </button>
                      {openDatePicker === task.id && (
                        <DateRangePicker startDate={task.startDate} endDate={task.endDate} onChange={(s, e) => updateTask(task.id, { startDate: s, endDate: e })} onClose={() => setOpenDatePicker(null)} />
                      )}
                    </div>
                    {/* ステータス */}
                    <div className="flex-shrink-0 overflow-hidden" style={{ width: COL_W }}>
                      <select
                        value={task.status}
                        onChange={e => { e.stopPropagation(); updateTaskStatus(task.id, e.target.value as Status); }}
                        onClick={e => e.stopPropagation()}
                        className={`text-[13px] px-1.5 py-0.5 rounded-full border font-medium cursor-pointer outline-none appearance-none ${STATUS_CONFIG[task.status].color} ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].border}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* 備考 */}
                    <div className="flex-shrink-0 overflow-hidden" style={{ width: COL_W }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={task.note}
                        onChange={e => updateTask(task.id, { note: e.target.value })}
                        onClick={e => e.stopPropagation()}
                        placeholder="メモを入力..."
                        className="w-full text-[13px] px-2 py-0.5 rounded border border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent focus:bg-card transition-colors placeholder-muted-foreground/50"
                      />
                    </div>
                    <div className="w-8 flex justify-end flex-shrink-0">
                      <button onClick={e => e.stopPropagation()} className="p-1 rounded text-transparent group-hover:text-muted-foreground hover:bg-muted transition-colors">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {crossTasks.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-[15px]">
                    {assigneeFilter === "all"
                      ? "未完了のタスクはありません"
                      : "この担当者の未完了タスクはありません"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Members page */}
      {activeNav === "members" && (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[15px] text-muted-foreground">{members.length}名のメンバー</p>
              <button
                onClick={() => { setNewMember({ name: "", initials: "", color: "#3b82f6", role: "", avatarUrl: "" }); setShowAddMember(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={13} />メンバーを追加
              </button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[13px] text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">名前</th>
                    <th className="w-20 px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <tr key={member.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar member={member} size="md" />
                          <div className="font-medium text-foreground text-[15px]">{member.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setEditingMember({ ...member })}
                            className="px-2.5 py-1 text-[13px] rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => setMembers(prev => prev.filter(m => m.id !== member.id))}
                            className="px-2.5 py-1 text-[13px] rounded-md border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-muted-foreground"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Member Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditingMember(null)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-medium text-foreground">メンバーを編集</h3>
              <button onClick={() => setEditingMember(null)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"><X size={14} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">名前</label>
                <input className="w-full text-[15px] border border-border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary" value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-2">プロフィール画像</label>
                <ImageDropZone value={editingMember.avatarUrl} onChange={url => setEditingMember({ ...editingMember, avatarUrl: url })} />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">カラー</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="w-8 h-8 rounded cursor-pointer border border-border" value={editingMember.color} onChange={e => setEditingMember({ ...editingMember, color: e.target.value })} />
                  <span className="text-[13px] text-muted-foreground">{editingMember.color}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingMember(null)} className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">キャンセル</button>
              <button
                onClick={() => { setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m)); setEditingMember(null); }}
                className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Member Add Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddMember(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-medium text-foreground">メンバーを追加</h3>
              <button onClick={() => setShowAddMember(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"><X size={14} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">名前</label>
                <input className="w-full text-[15px] border border-border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="例）山田 太郎" />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-2">プロフィール画像（任意）</label>
                <ImageDropZone value={newMember.avatarUrl} onChange={url => setNewMember({ ...newMember, avatarUrl: url })} />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">カラー</label>
                <input type="color" className="w-8 h-8 rounded cursor-pointer border border-border" value={newMember.color} onChange={e => setNewMember({ ...newMember, color: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAddMember(false)} className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">キャンセル</button>
              <button
                disabled={!newMember.name.trim()}
                onClick={() => {
                  if (!newMember.name.trim()) return;
                  setMembers(prev => [...prev, { ...newMember, id: `m${Date.now()}` }]);
                  setShowAddMember(false);
                }}
                className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-40"
              >追加</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddTask(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-foreground">新しいタスク</h3>
              <button onClick={() => setShowAddTask(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3 placeholder-muted-foreground"
              placeholder="タスク名を入力..."
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
            />
            <div className="flex items-center gap-2 mb-4">
              <select
                value={newTaskSection}
                onChange={e => setNewTaskSection(e.target.value)}
                className="text-[13px] bg-muted text-foreground rounded-md px-2 py-1.5 outline-none border-0"
              >
                <option value="">セクション選択</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddTask(false)}
                className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={addTask}
                disabled={!newTaskName.trim()}
                className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                タスクを追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新規Webプロジェクト作成モーダル */}
      {/* ワークスペースのロゴ変更 */}
      {showLogoEditor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowLogoEditor(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-foreground">ロゴを変更</h3>
              <button onClick={() => setShowLogoEditor(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                <X size={14} />
              </button>
            </div>
            <ImageDropZone value={workspaceLogo} onChange={setWorkspaceLogo} />
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setWorkspaceLogo("")}
                disabled={!workspaceLogo}
                className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              >
                既定のアイコンに戻す
              </button>
              <button
                onClick={() => setShowLogoEditor(false)}
                className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNewProject(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-foreground">Webサイト制作プロジェクトを追加</h3>
              <button onClick={() => setShowNewProject(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3 placeholder-muted-foreground"
              placeholder="例：株式会社○○ コーポレートサイト"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addWebProject()}
            />
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-[13px] text-muted-foreground mb-2">以下のセクション・タスクが自動で作成されます：</p>
              {WEB_TEMPLATE.map(s => (
                <div key={s.section} className="mb-1.5">
                  <span className="text-[13px] font-medium text-foreground">{s.section}</span>
                  <span className="text-[13px] text-muted-foreground ml-2">{s.tasks.join("・")}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewProject(false)} className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                キャンセル
              </button>
              <button
                onClick={addWebProject}
                disabled={!newProjectName.trim()}
                className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                作成する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* その他案件：案件（セクション）追加モーダル */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddSection(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-foreground">案件を追加</h3>
              <button onClick={() => setShowAddSection(false)} className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-4 placeholder-muted-foreground"
              placeholder="例：ロゴ制作、チラシデザイン..."
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addOtherSection()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddSection(false)} className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                キャンセル
              </button>
              <button
                onClick={addOtherSection}
                disabled={!newSectionName.trim()}
                className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
