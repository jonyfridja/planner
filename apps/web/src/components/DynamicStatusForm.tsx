import { TaskFieldType, type FieldDefinition } from "@planner/shared";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";

interface DynamicStatusFormProps {
  fields: FieldDefinition[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  disabled?: boolean;
}

function dateValue(value: unknown): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function DynamicStatusForm({ fields, values, onChange, disabled }: DynamicStatusFormProps) {
  return (
    <div className="flex flex-column gap-3">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-column gap-2">
          {field.type === TaskFieldType.BOOLEAN ? (
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId={field.name}
                checked={!!values[field.name]}
                onChange={(e) => onChange(field.name, !!e.checked)}
                disabled={disabled}
              />
              <label htmlFor={field.name}>
                {field.label}
                {field.required && " *"}
              </label>
            </div>
          ) : (
            <>
              <label htmlFor={field.name}>
                {field.label}
                {field.required && " *"}
              </label>
              {field.type === TaskFieldType.NUMBER ? (
                <InputNumber
                  inputId={field.name}
                  value={values[field.name] == null ? null : Number(values[field.name])}
                  onValueChange={(e) => onChange(field.name, e.value)}
                  disabled={disabled}
                  className="w-full"
                />
              ) : field.type === TaskFieldType.DATE ? (
                <Calendar
                  inputId={field.name}
                  value={dateValue(values[field.name])}
                  onChange={(e) => onChange(field.name, e.value ?? null)}
                  dateFormat="yy-mm-dd"
                  showIcon
                  disabled={disabled}
                  className="w-full"
                />
              ) : (
                <InputText
                  id={field.name}
                  required={field.required}
                  value={String(values[field.name] ?? "")}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  disabled={disabled}
                  className="w-full"
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
