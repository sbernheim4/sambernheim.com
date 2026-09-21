import type { Task } from "../model";
import "./TaskFields.css";

export const TaskFields = ({ form }: { form: any }) => {
  return (
    <div className="fields">
      <form.AppField name="name">
        {(field: any) => <field.TextField label="Task name" required />}
      </form.AppField>
      <form.AppField name="description">
        {(field: any) => <field.TextField label="Description" required />}
      </form.AppField>
      <form.AppField name="status">
        {(field: any) => (
          <field.SelectField
            label="Status"
            options={[
              { value: "queued", label: "Queued" },
              { value: "running", label: "Running" },
              { value: "completed", label: "Completed" },
              { value: "failed", label: "Failed" },
            ]}
          />
        )}
      </form.AppField>
      <form.AppField name="priority">
        {(field: any) => <field.TextField label="Priority" />}
      </form.AppField>
    </div>
  );
};

export const taskToForm = (task: Task) => {
  return { ...task, priority: String(task.priority) };
};
