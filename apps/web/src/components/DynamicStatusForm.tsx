import type { FieldDefinition } from "@planner/shared";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";

interface DynamicStatusFormProps {
  fields: FieldDefinition[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}

export function DynamicStatusForm({ fields, values, onChange }: DynamicStatusFormProps) {
  return (
    <div className="flex flex-column gap-3">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-column gap-2">
          <label htmlFor={field.name}>
            {field.label}
            {field.required && " *"}
          </label>
          {field.type === "number" ? (
            <InputNumber
              inputId={field.name}
              value={values[field.name] == null ? null : Number(values[field.name])}
              onValueChange={(e) => onChange(field.name, e.value)}
              className="w-full"
            />
          ) : (
            <InputText
              id={field.name}
              required={field.required}
              value={String(values[field.name] ?? "")}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="w-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}
