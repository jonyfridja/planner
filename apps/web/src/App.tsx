import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message } from "primereact/message";
import { fetchTasks } from "./api/tasks";
import { fetchTaskTypes } from "./api/taskTypes";
import { fetchUsers } from "./api/users";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { TaskDetail } from "./components/TaskDetail";
import { AddTaskDialog } from "./components/AddTaskDialog";

export function App() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const taskTypesQuery = useQuery({ queryKey: ["taskTypes"], queryFn: fetchTaskTypes });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const taskTypes = taskTypesQuery.data ?? [];
  const users = usersQuery.data ?? [];

  useEffect(() => {
    if (!currentUserId && users.length > 0) {
      setCurrentUserId(users[0].id);
    }
  }, [users, currentUserId]);

  const assigneeFilter = onlyMine ? currentUserId : undefined;
  const tasksQuery = useQuery({
    queryKey: ["tasks", { search: debouncedSearch, assigneeId: assigneeFilter }],
    queryFn: () => fetchTasks({ search: debouncedSearch || undefined, assigneeId: assigneeFilter }),
    enabled: !onlyMine || !!currentUserId,
  });
  const tasks = tasksQuery.data ?? [];

  const loadError = tasksQuery.error ?? taskTypesQuery.error ?? usersQuery.error;
  const displayError = error ?? (loadError ? (loadError as Error).message : null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="flex flex-column" style={{ height: "100vh" }}>
      <Header
        users={users}
        currentUserId={currentUserId}
        onChangeUser={setCurrentUserId}
        onAddTask={() => setIsAddDialogOpen(true)}
      />
      {displayError && <Message severity="error" text={displayError} className="w-full" />}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          tasks={tasks}
          taskTypes={taskTypes}
          selectedTaskId={selectedTaskId}
          onSelect={setSelectedTaskId}
          search={search}
          onSearchChange={setSearch}
          onlyMine={onlyMine}
          onOnlyMineChange={setOnlyMine}
        />
        <main className="flex-1 overflow-y-auto p-5">
          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              taskType={taskTypes.find((t) => t.type === selectedTask.taskType)}
              currentUserId={currentUserId}
              onDeleted={() => setSelectedTaskId(null)}
              onError={setError}
            />
          ) : (
            <p className="text-color-secondary">Select a task from the sidebar to view it here.</p>
          )}
        </main>
      </div>
      <AddTaskDialog
        visible={isAddDialogOpen}
        onHide={() => setIsAddDialogOpen(false)}
        taskTypes={taskTypes}
        users={users}
        defaultAssigneeId={currentUserId}
        onCreated={(taskId) => {
          setSelectedTaskId(taskId);
          setIsAddDialogOpen(false);
        }}
        onError={setError}
      />
    </div>
  );
}
