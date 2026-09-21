import type { Process } from "../model";
import "./ProcessFields.css";

export const ProcessFields = ({ form }: { form: any }) => {
  return (
    <div className="runtime-fields">
    <form.AppField name="name">
      {(field: any) => <field.TextField label="Process name" required />}
    </form.AppField>
    <form.AppField name="command">
      {(field: any) => <field.TextField label="Command" required />}
    </form.AppField>
    <form.AppField name="status">
      {(field: any) => (
        <field.SelectField
          label="Status"
          options={[
            { value: "starting", label: "Starting" },
            { value: "running", label: "Running" },
            { value: "stopped", label: "Stopped" },
            { value: "failed", label: "Failed" },
          ]}
        />
      )}
    </form.AppField>
    </div>
  );
};

export const processToForm = (process: Process) => {
  return process;
};
