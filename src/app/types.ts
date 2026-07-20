export type Status = "todo" | "in_progress" | "done";

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  avatarUrl: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  assigneeId: string | null;
  startDate: string | null;
  endDate: string | null;
  status: Status;
  description: string;
  completed: boolean;
  tags: string[];
  subtasks: { id: string; name: string; done: boolean }[];
  comments: { id: string; authorId: string; text: string; time: string }[];
  section: string;
  note: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  starred: boolean;
  taskCount: number;
  completedCount: number;
}
