import { useStore } from "./hooks/useStore";
import { useMembers } from "./hooks/useMembers";
import { useProjects } from "./hooks/useProjects";
import { useTasks } from "./hooks/useTasks";
import { useWorkspace } from "./hooks/useWorkspace";
import { useNavigation } from "./hooks/useNavigation";
import { useModals } from "./hooks/useModals";
import { useDeleteFlow } from "./hooks/useDeleteFlow";
import { useSidebarResize } from "./hooks/useSidebarResize";
import { WEB_TEMPLATE } from "./data";
import { Sidebar } from "./components/Sidebar";
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectToolbar } from "./components/ProjectToolbar";
import { ListView } from "./components/ListView";
import { BoardView } from "./components/BoardView";
import { AllTasksView } from "./components/AllTasksView";
import { MembersView } from "./components/MembersView";
import { AppModals } from "./components/AppModals";
import { ErrorToast } from "./components/ErrorToast";

/** ログイン後の画面全体。データはフック、画面の状態は useNavigation / useModals、組み立てだけをここで行う */
export default function App({ onSignOut }: { onSignOut: () => void }) {
  const { store, loading, error, clearError } = useStore();
  const { tasks, addTask, updateTask, updateTaskStatus, removeTask } = useTasks(store);
  const projectsApi = useProjects(store);
  const { projects, sections, otherProject } = projectsApi;
  const { members, addMember, updateMember, removeMember } = useMembers(store);
  const workspace = useWorkspace(store);
  const sidebar = useSidebarResize();
  const nav = useNavigation(projects);
  const modals = useModals();
  const deletion = useDeleteFlow({
    projects,
    sections,
    tasks,
    removeProject: projectsApi.removeProject,
    removeSection: projectsApi.removeSection,
    removeTask,
  });

  const projectTasks = tasks.filter((t) => t.projectId === nav.currentProjectId);
  const filteredTasks = projectTasks.filter((t) => nav.filterStatus === "all" || t.status === nav.filterStatus);
  const projectSections = sections.filter((s) => s.projectId === nav.currentProjectId);
  const openCount = (list: typeof tasks) => list.filter((t) => t.status !== "done").length;

  function confirmDelete() {
    const target = deletion.confirm();
    // 開いていた案件を消したら、先頭の案件に戻す
    if (target?.kind === "project" && target.id === nav.currentProjectId) nav.resetProject();
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
        activeNav={nav.activeNav}
        selectedProjectId={nav.currentProjectId ?? ""}
        crossTaskCount={openCount(tasks)}
        workspaceName={workspace.name}
        workspaceLogo={workspace.logoUrl}
        onRenameWorkspace={workspace.rename}
        onEditLogo={() => modals.setShowLogoEditor(true)}
        onSelectNav={nav.setActiveNav}
        onSelectProject={nav.openProject}
        onReorderProjects={projectsApi.reorderProjects}
        onAddProject={() => modals.setShowNewProject(true)}
        onSignOut={onSignOut}
        width={sidebar.width}
        expanded={sidebar.expanded}
        onToggleExpanded={() => sidebar.setExpanded(!sidebar.expanded)}
        onResizeStart={sidebar.onResizeStart}
        resizing={sidebar.isResizing.current}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 高さ h-[60px] は左のサイドバーヘッダーと揃える必要がある。片方だけ変えないこと */}
        <header className="flex items-center justify-between px-6 h-[60px] bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {nav.activeNav === "project" && nav.currentProject && (
              <ProjectHeader
                project={nav.currentProject}
                openCount={openCount(projectTasks)}
                onRename={(name) => projectsApi.renameProject(nav.currentProject!.id, name)}
                onDelete={() => deletion.request("project", nav.currentProject!.id)}
              />
            )}
            {nav.activeNav !== "project" && (
              <h1 className="font-medium text-foreground" style={{ fontSize: "24px" }}>
                {nav.activeNav === "mytasks" ? "全タスク" : "メンバー"}
              </h1>
            )}
          </div>
        </header>

        {nav.activeNav === "project" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ProjectToolbar
              view={nav.view}
              onChangeView={nav.setView}
              filterStatus={nav.filterStatus}
              onChangeFilter={nav.setFilterStatus}
            />
            {nav.view === "list" ? (
              <ListView
                tasks={filteredTasks}
                sections={projectSections}
                members={members}
                isOtherProject={nav.currentProject?.isOther ?? false}
                onUpdateTask={updateTask}
                onUpdateStatus={updateTaskStatus}
                onAddTask={modals.openAddTask}
                onAddSection={() => modals.setShowAddSection(true)}
                onDeleteTask={(id) => deletion.request("task", id)}
                onDeleteSection={(id) => deletion.request("section", id)}
              />
            ) : (
              <BoardView
                tasks={filteredTasks}
                sections={projectSections}
                members={members}
                onUpdateTask={updateTask}
                onUpdateStatus={updateTaskStatus}
                onAddTask={() => modals.openAddTask("")}
                onDeleteTask={(id) => deletion.request("task", id)}
              />
            )}
          </div>
        )}

        {nav.activeNav === "mytasks" && (
          <AllTasksView
            tasks={tasks}
            projects={projects}
            sections={sections}
            members={members}
            onUpdateTask={updateTask}
            onUpdateStatus={updateTaskStatus}
            onOpenProject={nav.openProject}
            onDeleteTask={(id) => deletion.request("task", id)}
          />
        )}

        {nav.activeNav === "members" && (
          <MembersView
            members={members}
            onAdd={() => modals.setShowAddMember(true)}
            onEdit={modals.setEditingMember}
            onRemove={removeMember}
          />
        )}
      </div>

      {error && <ErrorToast message={error} onClose={clearError} />}

      <AppModals
        modals={modals}
        deletion={{ describe: deletion.describe, confirm: confirmDelete, cancel: deletion.cancel }}
        projectSections={projectSections}
        logoUrl={workspace.logoUrl}
        onAddTask={(name, sectionId) =>
          nav.currentProjectId && addTask({ projectId: nav.currentProjectId, sectionId, name })
        }
        onAddSection={(name) => otherProject && projectsApi.addSection(otherProject.id, name)}
        onCreateProject={(name) => nav.openProject(projectsApi.createProject(name, WEB_TEMPLATE).id)}
        onChangeLogo={workspace.setLogo}
        onAddMember={addMember}
        onUpdateMember={updateMember}
      />
    </div>
  );
}
