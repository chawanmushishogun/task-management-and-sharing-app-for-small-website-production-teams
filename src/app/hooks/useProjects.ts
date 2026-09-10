import * as repo from "../../repositories";
import { PROJECT_COLORS } from "../data";
import type { Project, Section, Task } from "../types";
import { createTask } from "./useTasks";
import type { Store } from "./useStore";

export interface ProjectTemplate {
  section: string;
  tasks: string[];
}

/**
 * 案件とセクションの一覧と更新操作。
 * 「その他案件」（isOther）は並び替え・追加・削除の対象外で、常に末尾に固定される。
 */
export function useProjects(store: Store) {
  const projects = store.data.projects;
  const sections = store.data.sections;
  const otherProject = projects.find((p) => p.isOther) ?? null;

  /** サイドバーの案件を並び替える。「その他案件」は対象外で常に末尾に残す */
  function reorderProjects(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const list = projects.filter((p) => !p.isOther);
    const from = list.findIndex((p) => p.id === sourceId);
    const to = list.findIndex((p) => p.id === targetId);
    if (from === -1 || to === -1) return;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const renumbered = next.map((p, i) => ({ ...p, position: i }));
    store.mutate(
      (prev) => ({ ...prev, projects: [...renumbered, ...prev.projects.filter((p) => p.isOther)] }),
      () => repo.updateProjectPositions(renumbered),
    );
  }

  /** テンプレートからセクション・タスクごと案件を作り、その案件を返す */
  function createProject(name: string, template: ProjectTemplate[]): Project {
    const normal = projects.filter((p) => !p.isOther);
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      color: PROJECT_COLORS[normal.length % PROJECT_COLORS.length],
      position: normal.length,
      isOther: false,
    };
    const newSections: Section[] = template.map((t, i) => ({
      id: crypto.randomUUID(),
      projectId: project.id,
      name: t.section,
      position: i,
    }));
    const newTasks: Task[] = template.flatMap((t, i) =>
      t.tasks.map((taskName) => createTask({ projectId: project.id, sectionId: newSections[i].id, name: taskName })),
    );
    store.mutate(
      (prev) => ({
        ...prev,
        projects: [...prev.projects.filter((p) => !p.isOther), project, ...prev.projects.filter((p) => p.isOther)],
        sections: [...prev.sections, ...newSections],
        tasks: [...prev.tasks, ...newTasks],
      }),
      async () => {
        await repo.insertProject(project);
        await repo.insertSections(newSections);
        await repo.insertTasks(newTasks);
      },
    );
    return project;
  }

  function renameProject(id: string, name: string) {
    store.mutate(
      (prev) => ({ ...prev, projects: prev.projects.map((p) => (p.id === id ? { ...p, name } : p)) }),
      () => repo.updateProject(id, { name }),
    );
  }

  /** 案件を削除する。中のセクション・タスクは DB 側の CASCADE で消える */
  function removeProject(id: string) {
    store.mutate(
      (prev) => {
        const sectionIds = new Set(prev.sections.filter((s) => s.projectId === id).map((s) => s.id));
        return {
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
          sections: prev.sections.filter((s) => s.projectId !== id),
          tasks: prev.tasks.filter((t) => !sectionIds.has(t.sectionId)),
        };
      },
      () => repo.deleteProject(id),
    );
  }

  /** 案件にセクションを追加する（「その他案件」では案件名に相当する） */
  function addSection(projectId: string, name: string): Section {
    const count = sections.filter((s) => s.projectId === projectId).length;
    const section: Section = { id: crypto.randomUUID(), projectId, name, position: count };
    store.mutate(
      (prev) => ({ ...prev, sections: [...prev.sections, section] }),
      () => repo.insertSections([section]),
    );
    return section;
  }

  /** セクションを削除する。中のタスクは DB 側の CASCADE で消える */
  function removeSection(id: string) {
    store.mutate(
      (prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== id),
        tasks: prev.tasks.filter((t) => t.sectionId !== id),
      }),
      () => repo.deleteSection(id),
    );
  }

  return {
    projects,
    sections,
    otherProject,
    createProject,
    renameProject,
    reorderProjects,
    removeProject,
    addSection,
    removeSection,
  };
}
