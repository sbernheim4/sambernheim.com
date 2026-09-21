import type { ExecutionProfile } from "../model";
import "./ExecutionProfileFields.css";

export const ExecutionProfileFields = ({ form }: { form: any }) => {
  return (
    <div className="execution-profile-fields fields">
      <form.AppField name="name">
        {(field: any) => <field.TextField label="Profile name" required />}
      </form.AppField>
      <form.AppField name="runtime">
        {(field: any) => (
          <field.AutocompleteField
            label="Runtime"
            placeholder="Search runtimes"
            options={[
              { value: "node-22", label: "Node.js 22" },
              { value: "python-3.13", label: "Python 3.13" },
              { value: "rust-1.88", label: "Rust 1.88" },
            ]}
          />
        )}
      </form.AppField>
      <form.AppField name="region">
        {(field: any) => (
          <field.AutocompleteField
            label="Region"
            placeholder="Search regions"
            options={[
              { value: "us-east", label: "US East" },
              { value: "us-west", label: "US West" },
              { value: "eu-west", label: "Europe West" },
            ]}
          />
        )}
      </form.AppField>
      <form.AppField name="timeoutMs">
        {(field: any) => <field.TextField label="Timeout (ms)" />}
      </form.AppField>
      <form.AppField name="memoryLimitMb">
        {(field: any) => (
          <field.RadioGroupField
            label="Memory limit"
            options={[
              { value: "256", label: "256 MB" },
              { value: "512", label: "512 MB" },
              { value: "1024", label: "1 GiB" },
              { value: "2048", label: "2 GiB" },
            ]}
          />
        )}
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
