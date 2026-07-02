import type { StatusSummary } from "@planner/shared";
import { Tooltip } from "primereact/tooltip";

export function StatusStepper({
  statuses,
  currentStatus,
}: {
  statuses: StatusSummary[];
  currentStatus: number;
}) {
  const currentIndex = statuses.findIndex((s) => s.value === currentStatus);

  return (
    <div className="flex flex-column gap-2">
      <span className="text-sm text-color-secondary">
        Step {currentIndex + 1} of {statuses.length}
      </span>
      <div className="flex align-items-center">
        <Tooltip target=".status-stepper-dot" position="top" />
        {statuses.flatMap((status, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const dot = (
            <span
              key={`dot-${status.value}`}
              data-pr-tooltip={status.label}
              className={`status-stepper-dot border-circle flex-shrink-0 border-2 cursor-pointer transition-colors transition-duration-150 ${
                isCurrent ? "bg-primary border-primary" : isDone ? "bg-primary-300 border-primary-300" : "surface-0 border-300"
              }`}
              style={{ width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10 }}
            />
          );
          const connector =
            index < statuses.length - 1 ? (
              <div
                key={`line-${status.value}`}
                className={`flex-1 ${isDone ? "bg-primary-300" : "surface-300"}`}
                style={{ height: 2 }}
              />
            ) : null;
          return connector ? [dot, connector] : [dot];
        })}
      </div>
    </div>
  );
}
