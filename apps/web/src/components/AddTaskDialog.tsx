import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskTypeSummary, User } from "@planner/shared";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { createTask } from "../api/tasks";

export function AddTaskDialog({
  visible,
  onHide,
  taskTypes,
  users,
  defaultAssigneeId,
  onCreated,
  onError,
}: {
  visible: boolean;
  onHide: () => void;
  taskTypes: TaskTypeSummary[];
  users: User[];
  defaultAssigneeId: string;
  onCreated: (taskId: string) => void;
  onError: (message: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState(taskTypes[0]?.type ?? "");
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId);

  useEffect(() => {
    if (visible) {
      setTitle("");
      setTaskType(taskTypes[0]?.type ?? "");
      setAssigneeId(defaultAssigneeId);
    }
  }, [visible, taskTypes, defaultAssigneeId]);

  const queryClient = useQueryClient();
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onCreated(task.id);
    },
    onError: (err) => onError((err as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const type = taskType || taskTypes[0]?.type;
    const assignee = assigneeId || defaultAssigneeId;
    if (!title.trim() || !type || !assignee) return;
    createTaskMutation.mutate({ title, taskType: type, assigneeId: assignee });
  }

  return (
    <Dialog
      header="New task"
      visible={visible}
      onHide={() => !createTaskMutation.isPending && onHide()}
      closable={!createTaskMutation.isPending}
      style={{ width: "28rem" }}
      modal
    >
      <form onSubmit={handleSubmit} className="flex flex-column gap-3 pt-2">
        <InputText
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          disabled={createTaskMutation.isPending}
        />
        <Dropdown
          value={taskType || taskTypes[0]?.type}
          onChange={(e) => setTaskType(e.value)}
          options={taskTypes.map((t) => ({ label: t.label, value: t.type }))}
          placeholder="Task type"
          disabled={createTaskMutation.isPending}
        />
        <Dropdown
          value={assigneeId || defaultAssigneeId}
          onChange={(e) => setAssigneeId(e.value)}
          options={users.map((u) => ({ label: u.name, value: u.id }))}
          placeholder="Assignee"
          disabled={createTaskMutation.isPending}
        />
        <Button type="submit" label="Create" loading={createTaskMutation.isPending} />
      </form>
    </Dialog>
  );
}
