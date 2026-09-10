import { supabase } from "../lib/supabase";
import type { Member, Project, Section, Task, Workspace } from "../app/types";
import {
  fromMember,
  fromProject,
  fromSection,
  fromTask,
  taskPatchToRow,
  toMember,
  toProject,
  toSection,
  toTask,
  toWorkspace,
  type MemberRow,
  type ProjectRow,
  type SectionRow,
  type TaskRow,
  type WorkspaceRow,
} from "./rows";

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? "unknown error"}`);
}

export interface Snapshot {
  workspace: Workspace | null;
  members: Member[];
  projects: Project[];
  sections: Section[];
  tasks: Task[];
}

/**
 * 初期表示に必要なデータをまとめて取る。
 * 案件→セクション→タスクはネストした select で1リクエスト（N+1 を避ける）。
 */
export async function loadSnapshot(): Promise<Snapshot> {
  const [ws, mem, proj] = await Promise.all([
    supabase.from("workspaces").select("id,name,logo_url").limit(1).maybeSingle<WorkspaceRow>(),
    supabase.from("members").select("id,name,color,avatar_url").order("created_at"),
    supabase
      .from("projects")
      .select(
        "id,name,color,position,is_other,sections(id,project_id,name,position,tasks(id,section_id,assignee_id,name,status,start_date,end_date,note,created_at))",
      )
      .order("position")
      .order("position", { referencedTable: "sections" })
      .order("created_at", { referencedTable: "sections.tasks" }),
  ]);
  if (ws.error) fail("workspaces の取得", ws.error);
  if (mem.error) fail("members の取得", mem.error);
  if (proj.error) fail("projects の取得", proj.error);

  type Nested = ProjectRow & { sections: (SectionRow & { tasks: TaskRow[] })[] };
  const rows = (proj.data ?? []) as unknown as Nested[];

  const projects: Project[] = [];
  const sections: Section[] = [];
  const tasks: Task[] = [];
  for (const p of rows) {
    projects.push(toProject(p));
    for (const s of p.sections) {
      sections.push(toSection(s));
      for (const t of s.tasks) tasks.push(toTask(t, p.id));
    }
  }
  return {
    workspace: ws.data ? toWorkspace(ws.data) : null,
    members: (mem.data as MemberRow[]).map(toMember),
    projects,
    sections,
    tasks,
  };
}

// --- workspaces ---
export async function updateWorkspace(id: string, patch: { name?: string; logoUrl?: string | null }) {
  const row: Partial<WorkspaceRow> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.logoUrl !== undefined) row.logo_url = patch.logoUrl;
  const { error } = await supabase.from("workspaces").update(row).eq("id", id);
  if (error) fail("workspaces の更新", error);
}

// --- members ---
export async function insertMember(member: Member) {
  const { error } = await supabase.from("members").insert(fromMember(member));
  if (error) fail("members の追加", error);
}
export async function updateMember(member: Member) {
  const { id, ...row } = fromMember(member);
  const { error } = await supabase.from("members").update(row).eq("id", id);
  if (error) fail("members の更新", error);
}
export async function deleteMember(id: string) {
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) fail("members の削除", error);
}

// --- projects ---
export async function insertProject(project: Project) {
  const { error } = await supabase.from("projects").insert(fromProject(project));
  if (error) fail("projects の追加", error);
}
export async function updateProject(id: string, patch: { name?: string }) {
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) fail("projects の更新", error);
}
/** 並び替え後の position をまとめて保存する */
export async function updateProjectPositions(projects: Project[]) {
  const { error } = await supabase.from("projects").upsert(projects.map(fromProject));
  if (error) fail("projects の並び替え", error);
}
export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) fail("projects の削除", error);
}

// --- sections ---
export async function insertSections(sections: Section[]) {
  if (sections.length === 0) return;
  const { error } = await supabase.from("sections").insert(sections.map(fromSection));
  if (error) fail("sections の追加", error);
}

export async function deleteSection(id: string) {
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) fail("sections の削除", error);
}

// --- tasks ---
export async function insertTasks(tasks: Task[]) {
  if (tasks.length === 0) return;
  const { error } = await supabase.from("tasks").insert(tasks.map(fromTask));
  if (error) fail("tasks の追加", error);
}
/** 変えた列だけ update する（last write wins） */
export async function updateTask(id: string, patch: Partial<Task>) {
  const row = taskPatchToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("tasks").update(row).eq("id", id);
  if (error) fail("tasks の更新", error);
}
export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) fail("tasks の削除", error);
}
