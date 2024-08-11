export interface Column {
  column_id: number;
  title: string;
  position: number;
  order_id: number;
}

export interface CreateColumn {
  title: string;
  position: number;
  order_id: number;
}
