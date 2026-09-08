import { Form, useFormContext } from "../../../../forms/components/FormComponents";
import { FormEditor } from "../../../../forms/components";
import { useFormOrchestrator } from "../../../../forms/hooks/useFormOrchestrator";
import { regionOptions, sectorOptions } from "../fieldOptions";
import {
  useOrganizationOperationsForm,
  useOrganizationProfileForm,
} from "../hooks/organizationConfigurationForms";

export const OrganizationWorkspaceForm = ({
  organizationId,
  onDiscard,
}: {
  organizationId: string;
  onDiscard?: () => void;
}) => {
  const profile = useOrganizationProfileForm({ organizationId });
  const operations = useOrganizationOperationsForm({ organizationId });

  const conductor = useFormOrchestrator({
    forms: [profile, operations] as const,
    retry: { maxRetries: 1, delayMs: 500 },
  });

  const ready = profile.isReady && operations.isReady;
  const readError = profile.readError || operations.readError;

  return (
    <section className="workspace-section">
      <div className="workspace-section-heading">
        <h2>Organization configuration</h2>
      </div>
      <Form.Provider
        value={{
          form: conductor.provider,
          forms: { profile: profile.form, operations: operations.form },
          isReady: ready,
          isSaving: conductor.isSaving,
          isDirty: conductor.isDirty,
          onDiscard,
        }}
      >
        <FormEditor.Provider
          mode="edit"
          defaultTab="profile"
          actions={conductor.actions}
          cancelLabel="Stop editing"
          onCancel={() => {
            conductor.reset();
            onDiscard?.();
          }}
        >
          <FormEditor.Layout className="form-panel app-form-panel">
            <FormEditor.Main>
              <FormEditor.Header>
                <div className="panel-heading">
                  <div>
                    <h2>Organization configuration</h2>
                    <p>Profile and operations</p>
                  </div>
                  <FormEditor.Actions />
                </div>
                <FormEditor.TabList>
                  <FormEditor.TabTrigger name="profile" label="Profile" />
                  <FormEditor.TabTrigger name="operations" label="Operations" />
                </FormEditor.TabList>
              </FormEditor.Header>
              {readError ? (
                <p className="form-error" role="alert">Unable to load configuration.</p>
              ) : !ready ? (
                <p role="status">Loading configuration...</p>
              ) : null}
              <FormEditor.Error />
              <FormEditor.Content>
                <FormEditor.Tab name="profile">
                  <Form.Fields>
                    <section className="workspace-details">
                      <h3>Profile</h3>
                      <ProfileFields />
                    </section>
                  </Form.Fields>
                </FormEditor.Tab>
                <FormEditor.Tab name="operations">
                  <Form.Fields>
                    <section className="workspace-details">
                      <h3>Operations</h3>
                      <OperationsFields />
                    </section>
                  </Form.Fields>
                </FormEditor.Tab>
              </FormEditor.Content>
            </FormEditor.Main>
          </FormEditor.Layout>
          {conductor.phase !== "idle" && (
            <div role="status" aria-live="polite">
              <p>
                {conductor.isSaving
                  ? `Save progress: ${conductor.phase}`
                  : outcomeMessage(conductor.result?.outcome)}
              </p>
              <ul>
                {(["profile", "operations"] as const).map((formId) => {
                  const state = conductor.result?.forms[formId];
                  const status = state?.status ?? "unchanged";
                  return (
                    <li key={formId}>
                      {formId === "profile" ? "Profile" : "Operations"}: {status}
                      {state?.attempts
                        ? ` (${state.attempts} ${state.attempts === 1 ? "attempt" : "attempts"})`
                        : ""}
                      {state?.failure && (
                        <span className="form-error"> — {String(state.failure.error)}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </FormEditor.Provider>
      </Form.Provider>
    </section>
  );
};
const ProfileFields = () => {
  const form = useFormContext<ReturnType<typeof useOrganizationProfileForm>["form"]>("profile");
  return (
    <>
      <form.AppField
        name="displayName"
        validators={{
          onSubmit: ({ value }) => {
            return !value.trim() ? "Name is required." : undefined;
          },
        }}
      >
        {(field) => {
          return <field.TextField label="Name" required />;
        }}
      </form.AppField>
      <form.AppField name="selectedSector">
        {(field) => {
          return <field.SelectField label="Sector" options={sectorOptions} />;
        }}
      </form.AppField>
    </>
  );
};
const OperationsFields = () => {
  const form =
    useFormContext<ReturnType<typeof useOrganizationOperationsForm>["form"]>("operations");
  return (
    <>
      <form.AppField name="isActive">
        {(field) => {
          return (
            <fieldset className="app-radio-group">
              <legend>Status</legend>
              <label>
                <input
                  type="radio"
                  name="operations-status"
                  checked={field.state.value === true}
                  onChange={() => {
                    return field.handleChange(true);
                  }}
                  onBlur={field.handleBlur}
                />{" "}
                Active
              </label>
              <label>
                <input
                  type="radio"
                  name="operations-status"
                  checked={field.state.value === false}
                  onChange={() => {
                    return field.handleChange(false);
                  }}
                  onBlur={field.handleBlur}
                />{" "}
                Paused
              </label>
            </fieldset>
          );
        }}
      </form.AppField>
      <form.AppField name="region">
        {(field) => {
          return <field.SelectField label="Region" options={regionOptions} />;
        }}
      </form.AppField>
    </>
  );
};
const outcomeMessage = (outcome?: string) => {
  if (outcome === "success") {
    return "All changes saved.";
  }
  if (outcome === "saved-with-follow-up-errors") {
    return "All changes saved, but a follow-up action failed. The saved changes do not need to be submitted again.";
  }
  if (outcome === "partial-failure") {
    return "The save stopped. Saved sections remain persisted; failed and skipped sections retain their edits.";
  }
  return "Please correct the form errors. No changes were saved.";
};
