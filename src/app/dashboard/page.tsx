import KanbanBoard from "../_components/KanbanBoard";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Kanban Board</h1>
      <KanbanBoard />
    </div>
  );
};

export default Dashboard;
