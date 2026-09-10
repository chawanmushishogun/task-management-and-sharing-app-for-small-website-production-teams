export type Status = "todo" | "in_progress" | "done";

export interface Workspace {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface Member {
  id: string;
  name: string;
  color: string;
  avatarUrl: string | null;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  position: number;
  isOther: boolean;
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  position: number;
}

export interface Task {
  id: string;
  sectionId: string;
  /** sections.project_id から導く。DB には持たず、絞り込み用に読み込み時に付ける */
  projectId: string;
  name: string;
  assigneeId: string | null;
  startDate: string | null;
  endDate: string | null;
  status: Status;
  note: string;
}

/** 表示用のイニシャル。DB には持たず名前から作る */
export function initialsOf(name: string): string {
  return name.trim().charAt(0);
}
