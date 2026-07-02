import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskTypeSummary } from "@planner/shared";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { closeTask, deleteTask, reopenTask, transitionTask } from "../api/tasks";
import { DynamicStatusForm } from "./DynamicStatusForm";

export function TaskDetail({
  task,
  taskType,
  currentUserId,
  onDeleted,
  onError,
}: {
  task: Task;
  taskType: TaskTypeSummary | undefined;
  currentUserId: string;
  onDeleted: () => void;
  onError: (message: string) => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const queryClient = useQueryClient();

  const onMutationError = (err: unknown) => onError((err as Error).message);
  const onMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setValues({});
  };

  const transitionMutation = useMutation({
    mutationFn: (status: number) => transitionTask(task.id, { status, assigneeId: currentUserId, data: values }),
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });
  const closeMutation = useMutation({
    mutationFn: () => closeTask(task.id, { assigneeId: currentUserId }),
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });
  const reopenMutation = useMutation({
    mutationFn: () => reopenTask(task.id, { assigneeId: currentUserId }),
    onSuccess: onMutationSuccess,
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
  const initialStatus = taskType?.statuses[0]?.value ?? task.status;

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

      {!task.closed && (
        <div className="flex flex-column gap-3">
          {nextStatus && (
            <>
              <DynamicStatusForm
                fields={nextStatus.fields}
                values={values}
                onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
              />
              <Button
                label={`Advance to "${nextStatus.label}"`}
                loading={transitionMutation.isPending}
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
                loading={transitionMutation.isPending}
                onClick={() => transitionMutation.mutate(task.status - 1)}
              />
            )}

            {taskType && task.status === taskType.finalStatus && (
              <Button
                label="Close"
                severity="success"
                loading={closeMutation.isPending}
                onClick={() => closeMutation.mutate()}
              />
            )}

            <Button
              label="Delete"
              severity="danger"
              outlined
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            />
          </div>
        </div>
      )}

      {task.closed && (
        <Button label="Reopen" loading={reopenMutation.isPending} onClick={() => reopenMutation.mutate()} />
      )}
    </div>
  );
}
