import { useLocalStorage } from "./useLocalStorage";
import { OTHER_PROJECT_ID, PROJECT_COLORS, PROJECTS } from "../data";
import type { Project } from "../types";

/**
 * プロジェクトの一覧と更新操作をまとめたフック。
 * 「その他案件」は並び替え・追加の対象外で、常に末尾に固定される。
 */
export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", PROJECTS);

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

  /** 「その他案件」の手前に追加し、採番した ID を返す */
  function addProject(name: string, taskCount: number): string {
    const id = `p${Date.now()}`;
    const project: Project = {
      id,
      name,
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      starred: false,
      taskCount,
      completedCount: 0,
    };
    setProjects(prev => {
      const rest = prev.filter(p => p.id !== OTHER_PROJECT_ID);
      const other = prev.filter(p => p.id === OTHER_PROJECT_ID);
      return [...rest, project, ...other];
    });
    return id;
  }

  function renameProject(id: string, name: string) {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, name } : p)));
  }

  return { projects, addProject, renameProject, reorderProjects };
}
