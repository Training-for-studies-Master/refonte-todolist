export type ProjectStatus = "OPEN" | "CLOSED";

export type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt?: string;
  closedAt?: string | null;
  openTasksCount: number;
  closedTasksCount: number;
};