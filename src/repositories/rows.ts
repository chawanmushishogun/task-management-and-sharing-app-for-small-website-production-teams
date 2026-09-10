import type { Member, Project, Section, Task, Workspace } from "../app/types";

// DB の行（snake_case）と画面の型（camelCase）の変換をここに閉じ込める

export interface WorkspaceRow {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface MemberRow {
  id: string;
  name: string;
  color: string;
  avatar_url: string | null;
}

export interface ProjectRow {
  id: string;
  name: string;
  color: string;
  position: number;
  is_other: boolean;
}

export interface SectionRow {
  id: string;
  project_id: string;
  name: string;
  position: number;
}

export interface TaskRow {
  id: string;
  section_id: string;
  assignee_id: string | null;
  name: string;
  status: Task["status"];
  start_date: string | null;
  end_date: string | null;
  note: string;
}

export const toWorkspace = (r: WorkspaceRow): Workspace => ({ id: r.id, name: r.name, logoUrl: r.logo_url });
export const toMember = (r: MemberRow): Member => ({ id: r.id, name: r.name, color: r.color, avatarUrl: r.avatar_url });
export const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  name: r.name,
  color: r.color,
  position: r.position,
  isOther: r.is_other,
});
export const toSection = (r: SectionRow): Section => ({
  id: r.id,
  projectId: r.project_id,
  name: r.name,
  position: r.position,
});
export const toTask = (r: TaskRow, projectId: string): Task => ({
  id: r.id,
  sectionId: r.section_id,
  projectId,
  name: r.name,
  assigneeId: r.assignee_id,
  startDate: r.start_date,
  endDate: r.end_date,
  status: r.status,
  note: r.note,
});

export const fromMember = (m: Member): MemberRow => ({
  id: m.id,
  name: m.name,
  color: m.color,
  avatar_url: m.avatarUrl,
});
export const fromProject = (p: Project): ProjectRow => ({
  id: p.id,
  name: p.name,
  color: p.color,
  position: p.position,
  is_other: p.isOther,
});
export const fromSection = (s: Section): SectionRow => ({
  id: s.id,
  project_id: s.projectId,
  name: s.name,
  position: s.position,
});
export const fromTask = (t: Task): TaskRow => ({
  id: t.id,
  section_id: t.sectionId,
  assignee_id: t.assigneeId,
  name: t.name,
  status: t.status,
  start_date: t.startDate,
  end_date: t.endDate,
  note: t.note,
});

/** 画面の型の差分（Partial<Task> など）を DB の列名に直す */
export function taskPatchToRow(patch: Partial<Task>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {};
  if (patch.sectionId !== undefined) row.section_id = patch.sectionId;
  if (patch.assigneeId !== undefined) row.assignee_id = patch.assigneeId;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.endDate !== undefined) row.end_date = patch.endDate;
  if (patch.note !== undefined) row.note = patch.note;
  return row;
}
