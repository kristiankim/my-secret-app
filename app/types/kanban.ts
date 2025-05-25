export type Column = {
  id: string;
  title: string;
  order: number;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  columnId: string;
  done?: boolean;
};

export type Board = {
  columns: Column[];
}; 