import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskTypeSummary, User } from "@planner/shared";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { closeTask, deleteTask, reopenTask, transitionTask } from "../api/tasks";
import { DynamicStatusForm } from "./DynamicStatusForm";
import { StatusStepper } from "./StatusStepper";

export function TaskDetail({
  task,
  taskType,
  users,
  onDeleted,
  onError,
}: {
  task: Task;
  taskType: TaskTypeSummary | undefined;
  users: User[];
  onDeleted: () => void;
  onError: (message: string) => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(task.data ?? {});
  const [nextAssigneeId, setNextAssigneeId] = useState(task.userId);
  const queryClient = useQueryClient();

  useEffect(() => {
    setValues(task.data ?? {});
  }, [task.id, task.data]);

  useEffect(() => {
    setNextAssigneeId(task.userId);
  }, [task.id, task.userId]);

  const onMutationError = (err: unknown) => onError((err as Error).message);
  const onTaskUpdated = (updated: Task) => {
    queryClient.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (old) =>
      old?.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  const transitionMutation = useMutation({
    mutationFn: (status: number) => transitionTask(task.id, { status, assigneeId: nextAssigneeId, data: values }),
    onSuccess: onTaskUpdated,
    onError: onMutationError,
  });
  const closeMutation = useMutation({
    mutationFn: () => closeTask(task.id, { assigneeId: nextAssigneeId }),
    onSuccess: onTaskUpdated,
    onError: onMutationError,
  });
  const reopenMutation = useMutation({
    mutationFn: () => reopenTask(task.id, { assigneeId: nextAssigneeId }),
    onSuccess: onTaskUpdated,
    onError: onMutationError,
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onDeleted();
    },
    onError: onMutationError,
  });

  const nextStatus = taskType?.statuses.find((s) => s.value === task.status + 1);
  const currentStatus = taskType?.statuses.find((s) => s.value === task.status);
  const initialStatus = taskType?.statuses[0]?.value ?? task.status;
  // Forward moves need the next step's role; at the final status (closing/reopening)
  // there is no "next" step, so the current step's role applies instead.
  const assignRole = (nextStatus ?? currentStatus)?.requiredRole;
  const eligibleUsers = assignRole ? users.filter((u) => u.roles.includes(assignRole)) : users;

  const anyMutationPending =
    transitionMutation.isPending || closeMutation.isPending || reopenMutation.isPending || deleteMutation.isPending;

  const isNextFormValid =
    !nextStatus ||
    nextStatus.fields.every((field) => {
      if (!field.required) return true;
      const value = values[field.name];
      if (field.type === "number") return typeof value === "number" && !Number.isNaN(value);
      return value !== undefined && value !== null && String(value).trim() !== "";
    });

  return (
    <div className="flex flex-column gap-4 max-w-30rem">
      <div>
        <div className="flex align-items-center gap-2">
          <h2 className="m-0">{task.title}</h2>
          {task.closed && <Tag severity="secondary" value="Closed" />}
        </div>
        <div className="text-color-secondary mt-2">
          {taskType?.label ?? task.taskType}
          {taskType && (
            <Tag
              className="ml-2"
              severity="info"
              value={taskType.statuses.find((s) => s.value === task.status)?.label ?? String(task.status)}
            />
          )}
        </div>
      </div>

      {taskType && <StatusStepper statuses={taskType.statuses} currentStatus={task.status} />}

      <div className="flex flex-column gap-2">
        <label htmlFor="next-assignee">Assign to</label>
        <Dropdown
          inputId="next-assignee"
          value={nextAssigneeId}
          onChange={(e) => setNextAssigneeId(e.value)}
          options={eligibleUsers.map((u) => ({ label: u.name, value: u.id }))}
          placeholder="Choose user"
          disabled={anyMutationPending}
          className="w-full"
        />
      </div>

      {!task.closed && (
        <div className="flex flex-column gap-3">
          {nextStatus && (
            <>
              <DynamicStatusForm
                fields={nextStatus.fields}
                values={values}
                onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
                disabled={anyMutationPending}
              />
              <Button
                label={`Advance to "${nextStatus.label}"`}
                loading={transitionMutation.isPending && transitionMutation.variables === nextStatus.value}
                disabled={!isNextFormValid || !nextAssigneeId || anyMutationPending}
                onClick={() => transitionMutation.mutate(nextStatus.value)}
              />
            </>
          )}

          <div className="flex gap-2 flex-wrap">
            {task.status > initialStatus && (
              <Button
                label="Move back"
                severity="secondary"
                outlined
                loading={transitionMutation.isPending && transitionMutation.variables === task.status - 1}
                disabled={!nextAssigneeId || anyMutationPending}
                onClick={() => transitionMutation.mutate(task.status - 1)}
              />
            )}

            {taskType && task.status === taskType.finalStatus && (
              <Button
                label="Close"
                severity="success"
                loading={closeMutation.isPending}
                disabled={!nextAssigneeId || anyMutationPending}
                onClick={() => closeMutation.mutate()}
              />
            )}

            <Button
              label="Delete"
              severity="danger"
              outlined
              loading={deleteMutation.isPending}
              disabled={anyMutationPending}
              onClick={() => deleteMutation.mutate()}
            />
          </div>
        </div>
      )}

      {task.closed && (
        <Button
          label="Reopen"
          loading={reopenMutation.isPending}
          disabled={!nextAssigneeId || reopenMutation.isPending}
          onClick={() => reopenMutation.mutate()}
        />
      )}
    </div>
  );
}
