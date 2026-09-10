import type { Member, Section } from "../types";
import type { Modals } from "../hooks/useModals";
import { AddSectionModal } from "./modals/AddSectionModal";
import { AddTaskModal } from "./modals/AddTaskModal";
import { ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";
import { LogoModal } from "./modals/LogoModal";
import { MemberFormModal } from "./modals/MemberFormModal";
import { NewProjectModal } from "./modals/NewProjectModal";

/** M1〜M6 のモーダル。開閉状態は useModals / useDeleteFlow が持ち、ここは描画と確定処理の受け渡しだけ */
export function AppModals({
  modals,
  deletion,
  projectSections,
  logoUrl,
  onAddTask,
  onAddSection,
  onCreateProject,
  onChangeLogo,
  onAddMember,
  onUpdateMember,
}: {
  modals: Modals;
  deletion: {
    describe: () => { title: string; name: string; taskCount: number | undefined } | null | undefined;
    confirm: () => void;
    cancel: () => void;
  };
  projectSections: Section[];
  logoUrl: string;
  onAddTask: (name: string, sectionId: string) => void;
  onAddSection: (name: string) => void;
  onCreateProject: (name: string) => void;
  onChangeLogo: (url: string) => void;
  onAddMember: (draft: Omit<Member, "id">) => void;
  onUpdateMember: (member: Member) => void;
}) {
  const del = deletion.describe();
  return (
    <>
      {del && (
        <ConfirmDeleteModal
          title={del.title}
          targetName={del.name}
          taskCount={del.taskCount}
          onConfirm={deletion.confirm}
          onClose={deletion.cancel}
        />
      )}

      {modals.editingMember && (
        <MemberFormModal
          key={modals.editingMember.id}
          initial={modals.editingMember}
          onSubmit={(draft) => {
            onUpdateMember({ ...draft, id: modals.editingMember!.id });
            modals.setEditingMember(null);
          }}
          onClose={() => modals.setEditingMember(null)}
        />
      )}

      {modals.showAddMember && (
        <MemberFormModal
          onSubmit={(draft) => {
            onAddMember(draft);
            modals.setShowAddMember(false);
          }}
          onClose={() => modals.setShowAddMember(false)}
        />
      )}

      {modals.addTaskSectionId !== null && (
        <AddTaskModal
          sections={projectSections}
          defaultSectionId={modals.addTaskSectionId || null}
          onSubmit={(name, sectionId) => {
            onAddTask(name, sectionId);
            modals.closeAddTask();
          }}
          onClose={modals.closeAddTask}
        />
      )}

      {modals.showAddSection && (
        <AddSectionModal
          onSubmit={(name) => {
            onAddSection(name);
            modals.setShowAddSection(false);
          }}
          onClose={() => modals.setShowAddSection(false)}
        />
      )}

      {modals.showNewProject && (
        <NewProjectModal
          onSubmit={(name) => {
            onCreateProject(name);
            modals.setShowNewProject(false);
          }}
          onClose={() => modals.setShowNewProject(false)}
        />
      )}

      {modals.showLogoEditor && (
        <LogoModal logo={logoUrl} onChange={onChangeLogo} onClose={() => modals.setShowLogoEditor(false)} />
      )}
    </>
  );
}
