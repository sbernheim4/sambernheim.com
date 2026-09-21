import type { ExecutionProfile } from "../model";
import "./ExecutionProfileFields.css";

export const ExecutionProfileFields = ({ form }: { form: any }) => {
  return (
    <div className="runtime-fields">
      <form.AppField name="name">
        {(field: any) => <field.TextField label="Profile name" required />}
      </form.AppField>
      <form.AppField name="runtime">
        {(field: any) => <field.TextField label="Runtime" required />}
      </form.AppField>
      <form.AppField name="region">
        {(field: any) => <field.TextField label="Region" required />}
      </form.AppField>
      <form.AppField name="timeoutMs">
        {(field: any) => <field.TextField label="Timeout (ms)" />}
      </form.AppField>
      <form.AppField name="memoryLimitMb">
        {(field: any) => <field.TextField label="Memory limit (MB)" />}
      </form.AppField>
    </div>
  );
};

export const profileToForm = (profile: ExecutionProfile) => {
  return {
    ...profile,
    timeoutMs: String(profile.timeoutMs),
    memoryLimitMb: String(profile.memoryLimitMb),
  };
};
