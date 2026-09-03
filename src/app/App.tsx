import { useState } from "react";
import { Columns, List } from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMembers } from "./hooks/useMembers";
import { useProjects } from "./hooks/useProjects";
import { useSidebarResize } from "./hooks/useSidebarResize";
import { isSubmitEnter } from "./utils/keyboard";
import { useTasks } from "./hooks/useTasks";
import { OTHER_PROJECT_ID, STATUS_CONFIG, WEB_TEMPLATE } from "./data";
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
import { NewProjectModal } from "./components/modals/NewProjectModal";

export default function App() {
  const { tasks, addTask, addTasks, updateTask, updateTaskStatus } = useTasks();
  const { projects, addProject, renameProject, reorderProjects } = useProjects();
  const { members, addMember, updateMember, removeMember } = useMembers();
  const sidebar = useSidebarResize();

  const [workspaceName, setWorkspaceName] = useLocalStorage<string>("workspaceName", "Acme Corp");
  const [workspaceLogo, setWorkspaceLogo] = useLocalStorage<string>("workspaceLogo", "");

  const [activeNav, setActiveNav] = useState<NavKey>("project");
  const [selectedProjectId, setSelectedProjectId] = useState("p1");
  const [view, setView] = useState<ProjectView>("list");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");

  const [editingProject, setEditingProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState("");

  // モーダルの開閉。addTaskSection は「どのセクションに追加するか」を兼ねる
  const [addTaskSection, setAddTaskSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const isOtherProject = selectedProjectId === OTHER_PROJECT_ID;
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const filteredTasks = projectTasks.filter(t => filterStatus === "all" || t.status === filterStatus);
  const sections = [...new Set(projectTasks.map(t => t.section))];

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
    const taskCount = WEB_TEMPLATE.reduce((acc, s) => acc + s.tasks.length, 0);
    const id = addProject(name, taskCount);
    addTasks(WEB_TEMPLATE.flatMap(s => s.tasks.map(taskName => ({ projectId: id, name: taskName, section: s.section }))));
    openProject(id);
    setShowNewProject(false);
  }

  /** 「その他案件」の案件（セクション）は、プレースホルダのタスクを1件作ることで生やす */
  function createOtherSection(section: string) {
    addTask({ projectId: OTHER_PROJECT_ID, name: "タスクを追加", section });
    setShowAddSection(false);
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
      <Sidebar
        projects={projects}
        activeNav={activeNav}
        selectedProjectId={selectedProjectId}
        crossTaskCount={tasks.filter(t => !t.completed).length}
        workspaceName={workspaceName}
        workspaceLogo={workspaceLogo}
        onRenameWorkspace={setWorkspaceName}
        onEditLogo={() => setShowLogoEditor(true)}
        onSelectNav={setActiveNav}
        onSelectProject={openProject}
        onReorderProjects={reorderProjects}
        onAddProject={() => setShowNewProject(true)}
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
                    onChange={e => setProjectDraft(e.target.value)}
                    onBlur={() => commitProjectName(currentProject.id)}
                    onKeyDown={e => {
                      if (isSubmitEnter(e)) commitProjectName(currentProject.id);
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

        {activeNav === "project" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-2.5 bg-card border-b border-border flex-shrink-0">
              <div className="flex items-center rounded-md border border-border overflow-hidden">
                {([
                  { key: "list", label: "リスト", Icon: List },
                  { key: "board", label: "ボード", Icon: Columns },
                ] as const).map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={12} />{label}
                  </button>
                ))}
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

            {view === "list" ? (
              <ListView
                tasks={filteredTasks}
                members={members}
                isOtherProject={isOtherProject}
                onUpdateTask={updateTask}
                onUpdateStatus={updateTaskStatus}
                onAddTask={setAddTaskSection}
                onAddSection={() => setShowAddSection(true)}
              />
            ) : (
              <BoardView
                tasks={filteredTasks}
                members={members}
                isOtherProject={isOtherProject}
                onUpdateTask={updateTask}
                onUpdateStatus={updateTaskStatus}
                onAddTask={setAddTaskSection}
              />
            )}
          </div>
        )}

        {activeNav === "mytasks" && (
          <AllTasksView
            tasks={tasks}
            projects={projects}
            members={members}
            onUpdateTask={updateTask}
            onUpdateStatus={updateTaskStatus}
            onOpenProject={openProject}
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

      {editingMember && (
        <MemberFormModal
          key={editingMember.id}
          initial={editingMember}
          onSubmit={draft => { updateMember({ ...draft, id: editingMember.id }); setEditingMember(null); }}
          onClose={() => setEditingMember(null)}
        />
      )}

      {showAddMember && (
        <MemberFormModal
          onSubmit={draft => { addMember(draft); setShowAddMember(false); }}
          onClose={() => setShowAddMember(false)}
        />
      )}

      {addTaskSection !== null && (
        <AddTaskModal
          sections={sections}
          defaultSection={addTaskSection}
          onSubmit={(name, section) => {
            addTask({ projectId: selectedProjectId, name, section });
            setAddTaskSection(null);
          }}
          onClose={() => setAddTaskSection(null)}
        />
      )}

      {showAddSection && (
        <AddSectionModal onSubmit={createOtherSection} onClose={() => setShowAddSection(false)} />
      )}

      {showNewProject && (
        <NewProjectModal onSubmit={createWebProject} onClose={() => setShowNewProject(false)} />
      )}

      {showLogoEditor && (
        <LogoModal logo={workspaceLogo} onChange={setWorkspaceLogo} onClose={() => setShowLogoEditor(false)} />
      )}
    </div>
  );
}
