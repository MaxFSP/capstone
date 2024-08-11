export interface WorkOrders {
  order_id: number;
  name: string;
  machine_id: number;
  observations: string | null;
  start_date: Date;
  end_date: Date | null;
  assigned_user: number;
}

export interface WorkOrdersWithUser extends WorkOrders {
  userName: string;
  machine_serial: string;
}

export interface CreateWorkOrder {
  name: string;
  machine_id: number;
  observations: string;
  start_date: Date;
  assigned_user: number;
}

export interface UpdateWorkOrder {
  order_id: number;
  name?: string;
  machine_id?: number;
  observations?: string;
  start_date?: Date;
  end_date?: Date;
  assigned_user?: number;
}
