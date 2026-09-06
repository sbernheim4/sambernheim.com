import { Form } from "../../../forms/components/FormComponents";
export function FormActions({ creating }: { creating: boolean }) {
  return (
    <div className="form-actions">
      <Form.SaveButton label={creating ? "Create" : "Save changes"} />
      <Form.DiscardButton />
    </div>
  );
}
