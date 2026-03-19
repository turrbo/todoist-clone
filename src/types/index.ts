export type Priority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  content: string;
  description: string;
  projectId: string;
  sectionId: string | null;
  parentId: string | null;
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
  recurring: string | null;
  labels: string[];
  completed: boolean;
  completedAt: string | null;
  order: number;
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  order: number;
  isFavorite: boolean;
  isInbox: boolean;
  viewStyle: "list" | "board";
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  order: number;
  collapsed: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  order: number;
  isFavorite: boolean;
}

export interface Filter {
  id: string;
  name: string;
  query: string;
  color: string;
  order: number;
  isFavorite: boolean;
}

export const PROJECT_COLORS: Record<string, string> = {
  berry_red: "#b8255f",
  red: "#db4035",
  orange: "#ff9933",
  yellow: "#fad000",
  olive_green: "#afb83b",
  lime_green: "#7ecc49",
  green: "#299438",
  mint_green: "#6accbc",
  teal: "#158fad",
  sky_blue: "#14aaf5",
  light_blue: "#96c3eb",
  blue: "#4073ff",
  grape: "#884dff",
  violet: "#af38eb",
  lavender: "#eb96eb",
  magenta: "#e05194",
  salmon: "#ff8d85",
  charcoal: "#808080",
  grey: "#b8b8b8",
  taupe: "#ccac93",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  1: "#d1453b",
  2: "#eb8909",
  3: "#246fe0",
  4: "#808080",
};
