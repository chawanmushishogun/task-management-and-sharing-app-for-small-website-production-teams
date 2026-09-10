import { useState } from "react";
import type { Project, Section, Task } from "../types";

export type DeleteTarget = { kind: "project" | "section" | "task"; id: string };

/**
 * M6 削除の確認フロー。何を消そうとしているかを持ち、ダイアログに出す内容と確定処理を返す。
 * 削除そのものは各フックに任せる。
 */
export function useDeleteFlow({
  projects,
  sections,
  tasks,
  removeProject,
  removeSection,
  removeTask,
}: {
  projects: Project[];
  sections: Section[];
  tasks: Task[];
  removeProject: (id: string) => void;
  removeSection: (id: string) => void;
  removeTask: (id: string) => void;
}) {
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  /** ダイアログに出す内容。対象がもう無ければ null（＝閉じる） */
  function describe() {
    if (!target) return null;
    if (target.kind === "project") {
      const p = projects.find((x) => x.id === target.id);
      return p && { title: "案件を削除", name: p.name, taskCount: tasks.filter((t) => t.projectId === p.id).length };
    }
    if (target.kind === "section") {
      const s = sections.find((x) => x.id === target.id);
      return (
        s && {
          title: "案件（セクション）を削除",
          name: s.name,
          taskCount: tasks.filter((t) => t.sectionId === s.id).length,
        }
      );
    }
    const t = tasks.find((x) => x.id === target.id);
    return t && { title: "タスクを削除", name: t.name, taskCount: undefined };
  }

  /** 確定。消した対象を返す（案件を消したときに表示中の案件を切り替えるため） */
  function confirm(): DeleteTarget | null {
    if (!target) return null;
    if (target.kind === "project") removeProject(target.id);
    else if (target.kind === "section") removeSection(target.id);
    else removeTask(target.id);
    setTarget(null);
    return target;
  }

  return {
    target,
    request: (kind: DeleteTarget["kind"], id: string) => setTarget({ kind, id }),
    cancel: () => setTarget(null),
    describe,
    confirm,
  };
}
