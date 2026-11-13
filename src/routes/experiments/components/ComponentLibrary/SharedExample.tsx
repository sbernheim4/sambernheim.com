import {
  CommandPalette,
  Table,
  Text,
  DetailTabs,
  DetailSection,
  CycleableDateTime,
  Form,
} from "./renderer";
import { FormExample } from "./FormExample";
import { exampleDate } from "./catalog";
import type { ExampleProps } from "./useExampleState";

// This exact composition runs in React DOM and Ink. The host supplies the
// renderer once; component names, props, models, and actions stay the same.
export const SharedExample = (props: ExampleProps) => {
  if (props.id === "commands") {
    return <CommandPalette mode="inline" model={props.commandModel} />;
  }
  if (props.id === "table") {
    return <Table model={props.tableModel} interactive />;
  }
  if (props.id === "tabs") {
    return (
      <DetailTabs
        value={props.tab}
        onValueChange={props.onTabChange}
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: <Text>Website refresh · In progress</Text>,
          },
          { value: "activity", label: "Activity", children: <Text>Added a release task.</Text> },
          {
            value: "resources",
            label: "Resources",
            children: <Text>Design references and release plan.</Text>,
          },
        ]}
      />
    );
  }
  if (props.id === "section") {
    return (
      <DetailSection
        label="Project details"
        collapsible
        open={props.sectionOpen}
        onOpenChange={props.onSectionOpenChange}
      >
        <Text>Website refresh</Text>
        <Text>Small improvements, shipped often.</Text>
      </DetailSection>
    );
  }
  if (props.id === "date") {
    return <CycleableDateTime value={exampleDate} />;
  }
  return (
    <Form>
      <FormExample id={props.id} form={props.form} />
    </Form>
  );
};
