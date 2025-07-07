export type Task = {
  id: string;
  name: string;
  duration: number;
  predecessors: string; // Comma-separated string of task names
  successors: string[]; // Array of task names
  es: number | null;
  ef: number | null;
  ls: number | null;
  lf: number | null;
  float: number | null;
  isCritical: boolean;
  isCompleted: boolean;
};
