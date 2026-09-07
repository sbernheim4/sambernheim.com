import { createContext, useContext, type ReactNode } from "react";

export type FormScopeValue = {
  form: {
    handleSubmit: () => Promise<unknown>;
    reset: () => void;
    state?: { isDirty: boolean };
  };
  forms?: Record<string, unknown>;
  isReady: boolean;
  isSaving: boolean;
  isDirty: boolean;
  allowPristineSave?: boolean;
  error?: unknown;
  result?: {
    outcome?: string;
  };
  onDiscard?: () => void;
  onChange?: () => void;
  onSubmitError?: (error: unknown) => void;
};

const formScopeContext = createContext<FormScopeValue | null>(null);

const useFormScope = () => {
  const scope = useContext(formScopeContext);
  if (!scope) {
    throw new Error("Form components must be rendered inside FormScope.");
  }
  return scope;
};

export const useFormContext = <TForm = FormScopeValue["form"],>(id?: string) => {
  const scope = useFormScope();
  return ((id && scope.forms?.[id]) ?? scope.form) as TForm;
};

const FormScope = ({ value, children }: { value: FormScopeValue; children: ReactNode }) => {
  return <formScopeContext.Provider value={value}>{children}</formScopeContext.Provider>;
};

const FormShell = ({
  children,
  className = "resource-editor",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const scope = useFormScope();
  return (
    <form
      className={className}
      onChange={scope.onChange}
      onSubmit={(event) => {
        event.preventDefault();
        scope.onChange?.();
        void scope.form.handleSubmit().catch((error) => {
          scope.onSubmitError?.(error);
        });
      }}
    >
      {children}
    </form>
  );
};

const FormFields = ({
  children,
  className = "editor-fields",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const scope = useFormScope();
  return (
    <fieldset disabled={scope.isSaving || !scope.isReady} className={className}>
      {children}
    </fieldset>
  );
};

const FormSaveButton = ({
  label = "Save changes",
}: {
  label?: string;
} = {}) => {
  const scope = useFormScope();
  return (
    <button
      className="primary-action"
      type="submit"
      disabled={scope.isSaving || !scope.isReady || (!scope.isDirty && !scope.allowPristineSave)}
    >
      {scope.isSaving
        ? "Saving..."
        : scope.isDirty || scope.allowPristineSave
          ? label
          : "No changes to save"}
    </button>
  );
};

const FormDiscardButton = ({
  label,
  pristineLabel = "Go back",
}: {
  label?: string;
  pristineLabel?: string;
} = {}) => {
  const scope = useFormScope();
  const isDirty = scope.form.state?.isDirty ?? scope.isDirty;
  const buttonLabel = label ?? (isDirty ? "Discard changes" : pristineLabel);
  return (
    <button
      className="workspace-button"
      type="button"
      disabled={scope.isSaving}
      onClick={() => {
        if (isDirty) {
          scope.form.reset();
        }
        scope.onChange?.();
        scope.onDiscard?.();
      }}
    >
      {buttonLabel}
    </button>
  );
};

const FormFeedback = () => {
  const scope = useFormScope();
  return (
    <>
      {scope.error && (
        <p className="form-error" role="alert">
          {String(scope.error)}
        </p>
      )}
      {scope.result?.outcome === "saved-with-follow-up-errors" && (
        <p role="status">Saved, but a follow-up action failed.</p>
      )}
    </>
  );
};

const FormSingle = ({
  value,
  children,
  saveLabel = "Save changes",
  pristineLabel = "Go back",
  saved = false,
}: {
  value: FormScopeValue;
  children: ReactNode;
  saveLabel?: string;
  pristineLabel?: string;
  saved?: boolean;
}) => {
  return (
    <FormScope value={value}>
      <FormShell>
        <FormFields>
          {children}
          <div className="form-actions">
            <FormSaveButton label={saveLabel} />
            <FormDiscardButton pristineLabel={pristineLabel} />
          </div>
        </FormFields>
        <FormFeedback />
        {saved && (
          <p className="save-feedback" role="status">
            Changes saved.
          </p>
        )}
      </FormShell>
    </FormScope>
  );
};

export const Form = {
  Provider: FormScope,
  Shell: FormShell,
  Fields: FormFields,
  Single: FormSingle,
  SaveButton: FormSaveButton,
  DiscardButton: FormDiscardButton,
  Feedback: FormFeedback,
};
