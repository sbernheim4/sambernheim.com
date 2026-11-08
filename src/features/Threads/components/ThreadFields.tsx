import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";
import type { Thread } from "../model";
import "./ThreadFields.css";

export const ThreadFields = ({ form }: { form: any }) => {
  const { Section } = useWorkspaceRenderer();
  return (
    <Section className="thread-fields fields">
      <form.AppField name="name">
        {(field: any) => {
          return <field.TextField label="Thread name" required />;
        }}
      </form.AppField>
      <form.AppField name="entryPoint">
        {(field: any) => {
          return <field.TextField label="Entry point" required />;
        }}
      </form.AppField>
      <form.AppField name="status">
        {(field: any) => {
          return (
            <field.SelectField
              label="Status"
              options={[
                { value: "new", label: "New" },
                { value: "running", label: "Running" },
                { value: "blocked", label: "Blocked" },
                { value: "finished", label: "Finished" },
              ]}
            />
          );
        }}
      </form.AppField>
      <form.AppField name="priority">
        {(field: any) => {
          return <field.TextField label="Priority" />;
        }}
      </form.AppField>
    </Section>
  );
};

export const threadToForm = (thread: Thread) => {
  return { ...thread, priority: String(thread.priority) };
};
