import { useState } from "react";
import type { Member } from "../types";

/** モーダルの開閉状態。addTaskSectionId は「どのセクションに追加するか」を兼ねる（"" は未指定） */
export function useModals() {
  const [addTaskSectionId, setAddTaskSectionId] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return {
    addTaskSectionId,
    openAddTask: (sectionId: string) => setAddTaskSectionId(sectionId),
    closeAddTask: () => setAddTaskSectionId(null),
    showAddSection,
    setShowAddSection,
    showNewProject,
    setShowNewProject,
    showLogoEditor,
    setShowLogoEditor,
    showAddMember,
    setShowAddMember,
    editingMember,
    setEditingMember,
  };
}

export type Modals = ReturnType<typeof useModals>;
