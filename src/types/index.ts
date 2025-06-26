export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  date: string;
  created_at: string;
  completed_at?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}
