import type { Member, Project, Section, Task, Workspace } from "../app/types";
import type { Snapshot } from "../repositories";

// テスト用データの生成。既定値を埋めて、必要な項目だけ上書きする（FactoryBot 相当）

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

export function buildWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return { id: nextId("ws"), name: "Acme Corp", logoUrl: null, ...overrides };
}

export function buildMember(overrides: Partial<Member> = {}): Member {
  return { id: nextId("m"), name: "田中 花子", color: "#e8673c", avatarUrl: null, ...overrides };
}

export function buildProject(overrides: Partial<Project> = {}): Project {
  return { id: nextId("p"), name: "サンプル案件", color: "#3b82f6", position: 0, isOther: false, ...overrides };
}

export function buildSection(overrides: Partial<Section> = {}): Section {
  return { id: nextId("s"), projectId: "p-0", name: "デザイン", position: 0, ...overrides };
}

export function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: nextId("t"),
    sectionId: "s-0",
    projectId: "p-0",
    name: "トップページ",
    assigneeId: null,
    startDate: null,
    endDate: null,
    status: "todo",
    note: "",
    ...overrides,
  };
}

/** 案件1件（セクション1つ・タスク2つ）＋その他案件（セクション1つ）＋メンバー1人の最小構成 */
export function buildSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  const member = buildMember();
  const project = buildProject({ name: "Webサイト制作" });
  const other = buildProject({ name: "その他案件", isOther: true, position: 9999 });
  const section = buildSection({ projectId: project.id, name: "デザイン" });
  const otherSection = buildSection({ projectId: other.id, name: "チラシ修正" });
  const tasks = [
    buildTask({ projectId: project.id, sectionId: section.id, name: "トップページ PC版", assigneeId: member.id }),
    buildTask({ projectId: project.id, sectionId: section.id, name: "トップページ SP版", status: "done" }),
    buildTask({ projectId: other.id, sectionId: otherSection.id, name: "文言修正" }),
  ];
  return {
    workspace: buildWorkspace(),
    members: [member],
    projects: [project, other],
    sections: [section, otherSection],
    tasks,
    ...overrides,
  };
}
