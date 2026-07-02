import type { Task, TaskTypeSummary } from "@planner/shared";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";

export function Sidebar({
  tasks,
  taskTypes,
  selectedTaskId,
  onSelect,
  search,
  onSearchChange,
  onlyMine,
  onOnlyMineChange,
}: {
  tasks: Task[];
  taskTypes: TaskTypeSummary[];
  selectedTaskId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onlyMine: boolean;
  onOnlyMineChange: (value: boolean) => void;
}) {
  return (
    <aside className="w-25rem border-right-1 surface-border flex flex-column h-full">
      <div className="flex flex-column gap-3 p-3 border-bottom-1 surface-border">
        <InputText
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks"
          className="w-full"
        />
        <div className="flex align-items-center gap-2">
          <Checkbox
            inputId="only-mine"
            checked={onlyMine}
            onChange={(e) => onOnlyMineChange(!!e.checked)}
          />
          <label htmlFor="only-mine">My tasks</label>
        </div>
      </div>
      <ul className="list-none p-0 m-0 overflow-y-auto flex-1">
        {tasks.map((task) => {
          const taskType = taskTypes.find((t) => t.type === task.taskType);
          const statusLabel = taskType?.statuses.find((s) => s.value === task.status)?.label ?? String(task.status);
          return (
            <li
              key={task.id}
              onClick={() => onSelect(task.id)}
              className={`p-3 border-bottom-1 surface-border cursor-pointer hover:surface-hover ${task.id === selectedTaskId ? "surface-100" : ""
                }`}
            >
              <div className="flex align-items-center justify-content-between gap-2">
                <span className="font-medium">{task.title}</span>
                {task.closed && <Tag severity="secondary" value="Closed" />}
              </div>
              <div className="text-sm text-color-secondary mt-1">
                {taskType?.label ?? task.taskType} — {statusLabel}
              </div>
            </li>
          );
        })}
        {tasks.length === 0 && <li className="p-3 text-color-secondary">No tasks found.</li>}
      </ul>
    </aside>
  );
}
