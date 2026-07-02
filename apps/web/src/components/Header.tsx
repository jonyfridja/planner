import type { User } from "@planner/shared";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

export function Header({
  users,
  currentUserId,
  onChangeUser,
  onAddTask,
}: {
  users: User[];
  currentUserId: string;
  onChangeUser: (userId: string) => void;
  onAddTask: () => void;
}) {
  return (
    <header className="flex align-items-center justify-content-between px-4 py-3 surface-card shadow-1">
      <span className="text-2xl font-bold">Planner</span>
      <div className="flex align-items-center gap-3">
        <Button label="New Task" icon="pi pi-plus" onClick={onAddTask} />
        <Dropdown
          value={currentUserId}
          onChange={(e) => onChangeUser(e.value)}
          options={users.map((u) => ({ label: u.name, value: u.id }))}
          placeholder="Choose user"
        />
      </div>
    </header>
  );
}
