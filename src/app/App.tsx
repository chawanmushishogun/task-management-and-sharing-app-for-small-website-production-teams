import { useState } from "react";
import { Columns, List, Trash2 } from "lucide-react";
import { useStore } from "./hooks/useStore";
import { useMembers } from "./hooks/useMembers";
import { useProjects } from "./hooks/useProjects";
import { useTasks } from "./hooks/useTasks";
import { useWorkspace } from "./hooks/useWorkspace";
import { useSidebarResize } from "./hooks/useSidebarResize";
import { isSubmitEnter } from "./utils/keyboard";
import { STATUS_CONFIG, WEB_TEMPLATE } from "./data";
import type { Member, Status } from "./types";
import type { NavKey, ProjectView } from "./navigation";
import { Sidebar } from "./components/Sidebar";
import { ListView } from "./components/ListView";
import { BoardView } from "./components/BoardView";
import { AllTasksView } from "./components/AllTasksView";
import { MembersView } from "./components/MembersView";
import { AddSectionModal } from "./components/modals/AddSectionModal";
import { AddTaskModal } from "./components/modals/AddTaskModal";
import { LogoModal } from "./components/modals/LogoModal";
import { MemberFormModal } from "./components/modals/MemberFormModal";
import { ConfirmDeleteModal } from "./components/modals/ConfirmDeleteModal";
import { NewProjectModal } from "./components/modals/NewProjectModal";

export default function App({ onSignOut }: { onSignOut: () => void }) {
  const { store, loading, error, clearError } = useStore();
  const { tasks, addTask, updateTask, updateTaskStatus, removeTask } = useTasks(store);
  const {
    projects,
    sections,
    otherProject,
    createProject,
    renameProject,
    reorderProjects,
    removeProject,
    addSection,
    removeSection,
  } = useProjects(store);
  const { members, addMember, updateMember, removeMember } = useMembers(store);
  const workspace = useWorkspace(store);
  const sidebar = useSidebarResize();

  const [activeNav, setActiveNav] = useState<NavKey>("project");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [view, setView] = useState<ProjectView>("list");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");

  const [editingProject, setEditingProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState("");

  // モーダルの開閉。addTaskSectionId は「どのセクションに追加するか」を兼ねる（"" は未指定）
  const [addTaskSectionId, setAddTaskSectionId] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  // M6 削除の確認。何を消そうとしているかを持つ
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: "project"; id: string } | { kind: "section"; id: string } | { kind: "task"; id: string } | null
  >(null);

  // 初期表示は先頭の案件
  const currentProjectId = selectedProjectId ?? projects[0]?.id ?? null;
  const currentProject = projects.find((p) => p.id === currentProjectId);
  const isOtherProject = currentProject?.isOther ?? false;
  const projectTasks = tasks.filter((t) => t.projectId === currentProjectId);
  const filteredTasks = projectTasks.filter((t) => filterStatus === "all" || t.status === filterStatus);
  const projectSections = sections.filter((s) => s.projectId === currentProjectId);

  function openProject(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveNav("project");
    setEditingProject(false);
  }

  /** 空白のみの入力は保存せず、元の名前を維持する */
  function commitProjectName(projectId: string) {
    const name = projectDraft.trim();
    if (name) renameProject(projectId, name);
    setEditingProject(false);
  }

  /** テンプレートのセクション・タスクごと Webサイト制作プロジェクトを作る */
  function createWebProject(name: string) {
    const project = createProject(name, WEB_TEMPLATE);
    openProject(project.id);
    setShowNewProject(false);
  }

  /** 削除の確認ダイアログに出す内容。対象が消えていれば閉じる */
  function describeDeleteTarget() {
    if (!deleteTarget) return null;
    if (deleteTarget.kind === "project") {
      const p = projects.find((x) => x.id === deleteTarget.id);
      if (!p) return null;
      return { title: "案件を削除", name: p.name, taskCount: tasks.filter((t) => t.projectId === p.id).length };
    }
    if (deleteTarget.kind === "section") {
      const s = sections.find((x) => x.id === deleteTarget.id);
      if (!s) return null;
      return {
        title: "案件（セクション）を削除",
        name: s.name,
        taskCount: tasks.filter((t) => t.sectionId === s.id).length,
      };
    }
    const t = tasks.find((x) => x.id === deleteTarget.id);
    return t ? { title: "タスクを削除", name: t.name, taskCount: undefined } : null;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "project") {
      removeProject(deleteTarget.id);
      // 消した案件を開いていたら、先頭の案件に戻す
      if (currentProjectId === deleteTarget.id) setSelectedProjectId(null);
    } else if (deleteTarget.kind === "section") {
      removeSection(deleteTarget.id);
    } else {
      removeTask(deleteTarget.id);
    }
    setDeleteTarget(null);
  }

  /** 「その他案件」の案件（セクション）を追加する */
  function createOtherSection(name: string) {
    if (otherProject) addSection(otherProject.id, name);
    setShowAddSection(false);
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[13px] text-muted-foreground">読み込み中…</div>
    );
  }

  return (
    <div
      className="flex h-screen bg-background overflow-hidden"
      style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }}
    >
      <Sidebar
        projects={projects}
        activeNav={activeNav}
        selectedProjectId={currentProjectId ?? ""}
        crossTaskCount={tasks.filter((t) => t.status !== "done").length}
        workspaceName={workspace.name}
        workspaceLogo={workspace.logoUrl}
        onRenameWorkspace={workspace.rename}
        onEditLogo={() => setShowLogoEditor(true)}
        onSelectNav={setActiveNav}
        onSelectProject={openProject}
        onReorderProjects={reorderProjects}
        onAddProject={() => setShowNewProject(true)}
        onSignOut={onSignOut}
        width={sidebar.width}
        expanded={sidebar.expanded}
        onToggleExpanded={() => sidebar.setExpanded(!sidebar.expanded)}
        onResizeStart={sidebar.onResizeStart}
        resizing={sidebar.isResizing.current}
      />

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
                    onChange={(e) => setProjectDraft(e.target.value)}
                    onBlur={() => commitProjectName(currentProject.id)}
                    onKeyDown={(e) => {
                      if (isSubmitEnter(e)) commitProjectName(currentProject.id);
                      if (e.key === "Escape") setEditingProject(false);
                    }}
                    className="font-medium text-foreground bg-transparent outline-none border-b border-primary"
                    style={{ fontSize: "24px" }}
                  />
                ) : (
                  <h1
                    onClick={() => {
                      setProjectDraft(currentProject.name);
                      setEditingProject(true);
                    }}
                    title="クリックして名前を変更"
                    className="font-medium text-foreground cursor-text hover:underline decoration-dotted underline-offset-4"
                    style={{ fontSize: "24px" }}
                  >
                    {currentProject.name}
                  </h1>
                )}
                <span className="text-[13px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {projectTasks.filter((t) => t.status !== "done").length}件
                </span>
                {!currentProject.isOther && (
                  <button
                    onClick={() => setDeleteTarget({ kind: "project", id: currentProject.id })}
                    title="この案件を削除"
                    className="ml-2 flex items-center gap-1 text-[12px] text-muted-foreground hover:text-destructive px-2 py-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <Trash2 size={12} />
                    案件を削除
                  </button>
                )}
              </>
            )}
            {activeNav === "mytasks" && (
              <h1 className="font-medium text-foreground" style={{ fontSize: "24px" }}>
                全タスク
              </h1>
            )}
            {activeNav === "members" && (
              <h1 className="font-medium text-foreground" style={{ fontSize: "24px" }}>
                メンバー
              </h1>
            )}
          </div>
        </header>

        {activeNav === "project" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
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
                    onClick={() => setView(key)}
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

            {view === "list" ? (
              <ListView
                tasks={filteredTasks}
                sections={projectSections}
                members={members}
                isOtherProject={isOtherProject}
                onUpdateTask={updateTask}
                onUpdateStatus={updateTaskStatus}
                onAddTask={setAddTaskSectionId}
                onAddSection={() => setShowAddSection(true)}
                onDeleteTask={(id) => setDeleteTarget({ kind: "task", id })}
                onDeleteSection={(id) => setDeleteTarget({ kind: "section", id })}
              />
            ) : (
              <BoardView
                tasks={filteredTasks}
                sections={projectSections}
                members={members}
                isOtherProject={isOtherProject}
                onUpdateTask={updateTask}
                onUpdateStatus={updateTaskStatus}
                onAddTask={() => setAddTaskSectionId("")}
                onDeleteTask={(id) => setDeleteTarget({ kind: "task", id })}
              />
            )}
          </div>
        )}

        {activeNav === "mytasks" && (
          <AllTasksView
            tasks={tasks}
            projects={projects}
            sections={sections}
            members={members}
            onUpdateTask={updateTask}
            onUpdateStatus={updateTaskStatus}
            onOpenProject={openProject}
            onDeleteTask={(id) => setDeleteTarget({ kind: "task", id })}
          />
        )}

        {activeNav === "members" && (
          <MembersView
            members={members}
            onAdd={() => setShowAddMember(true)}
            onEdit={setEditingMember}
            onRemove={removeMember}
          />
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="fixed bottom-4 right-4 z-50 max-w-md bg-destructive text-white text-[13px] rounded-lg shadow-lg px-4 py-3 flex items-start gap-3"
        >
          <span className="flex-1">エラー：{error}</span>
          <button onClick={clearError} className="opacity-80 hover:opacity-100">
            閉じる
          </button>
        </div>
      )}

      {(() => {
        const d = describeDeleteTarget();
        return (
          d && (
            <ConfirmDeleteModal
              title={d.title}
              targetName={d.name}
              taskCount={d.taskCount}
              onConfirm={confirmDelete}
              onClose={() => setDeleteTarget(null)}
            />
          )
        );
      })()}

      {editingMember && (
        <MemberFormModal
          key={editingMember.id}
          initial={editingMember}
          onSubmit={(draft) => {
            updateMember({ ...draft, id: editingMember.id });
            setEditingMember(null);
          }}
          onClose={() => setEditingMember(null)}
        />
      )}

      {showAddMember && (
        <MemberFormModal
          onSubmit={(draft) => {
            addMember(draft);
            setShowAddMember(false);
          }}
          onClose={() => setShowAddMember(false)}
        />
      )}

      {addTaskSectionId !== null && currentProjectId && (
        <AddTaskModal
          sections={projectSections}
          defaultSectionId={addTaskSectionId || null}
          onSubmit={(name, sectionId) => {
            addTask({ projectId: currentProjectId, sectionId, name });
            setAddTaskSectionId(null);
          }}
          onClose={() => setAddTaskSectionId(null)}
        />
      )}

      {showAddSection && <AddSectionModal onSubmit={createOtherSection} onClose={() => setShowAddSection(false)} />}

      {showNewProject && <NewProjectModal onSubmit={createWebProject} onClose={() => setShowNewProject(false)} />}

      {showLogoEditor && (
        <LogoModal logo={workspace.logoUrl} onChange={workspace.setLogo} onClose={() => setShowLogoEditor(false)} />
      )}
    </div>
  );
}
