import { useState } from "react";
import type { Project, Status } from "../types";
import type { NavKey, ProjectView } from "../navigation";

/** どの画面（全タスク / 案件 / メンバー）を、どの案件・表示・絞り込みで見ているか */
export function useNavigation(projects: Project[]) {
  const [activeNav, setActiveNav] = useState<NavKey>("project");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [view, setView] = useState<ProjectView>("list");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");

  // 未選択（初期表示・開いていた案件を消した直後）は先頭の案件
  const currentProjectId = selectedProjectId ?? projects[0]?.id ?? null;
  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null;

  function openProject(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveNav("project");
  }

  return {
    activeNav,
    setActiveNav,
    currentProjectId,
    currentProject,
    openProject,
    resetProject: () => setSelectedProjectId(null),
    view,
    setView,
    filterStatus,
    setFilterStatus,
  };
}
