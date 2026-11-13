import type { ExampleProps } from "./useExampleState";
import { options } from "./catalog";

// This exact form is rendered by both React DOM and Ink via FieldPrimitivesContext.
export const FormExample = ({ id, form }: Pick<ExampleProps, "id" | "form">) => {
  if (id === "text") {
    return (
      <form.AppField name="title">
        {(field) => {
          return <field.TextField label="Title" placeholder="Name your project" />;
        }}
      </form.AppField>
    );
  }
  return (
    <form.AppField name="status">
      {(field) => {
        return id === "select" ? (
          <field.SelectField label="Status" options={options} />
        ) : id === "radio" ? (
          <field.RadioGroupField label="Status" options={options} />
        ) : (
          <field.AutocompleteField label="Status" options={options} />
        );
      }}
    </form.AppField>
  );
};
