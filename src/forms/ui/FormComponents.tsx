import { createContext, useContext, type ReactNode } from "react";

type FormScopeValue = {
  form: {
    handleSubmit: () => Promise<unknown>;
    reset: () => void;
  };
  forms?: Record<string, unknown>;
  isReady: boolean;
  isSaving: boolean;
  isDirty: boolean;
  error?: unknown;
  result?: { outcome?: string };
  onDiscard?: () => void;
  onChange?: () => void;
  onSubmitError?: (error: unknown) => void;
};

const formScopeContext = createContext<FormScopeValue | null>(null);

function useFormScope() {
  const scope = useContext(formScopeContext);
  if (!scope) {
    throw new Error("Form components must be rendered inside FormScope.");
  }
  return scope;
}

export function useFormContext<TForm = FormScopeValue["form"]>(id?: string) {
  const scope = useFormScope();
  return ((id && scope.forms?.[id]) ?? scope.form) as TForm;
}

export function FormScope({ value, children }: { value: FormScopeValue; children: ReactNode }) {
  return <formScopeContext.Provider value={value}>{children}</formScopeContext.Provider>;
}

export function FormShell({
  children,
  className = "resource-editor",
}: {
  children: ReactNode;
  className?: string;
}) {
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
}

export function FormFields({
  children,
  className = "editor-fields",
}: {
  children: ReactNode;
  className?: string;
}) {
  const scope = useFormScope();
  return (
    <fieldset disabled={scope.isSaving || !scope.isReady} className={className}>
      {children}
    </fieldset>
  );
}

export function FormSaveButton({ label = "Save changes" }: { label?: string } = {}) {
  const scope = useFormScope();
  return (
    <button
      className="primary-action"
      type="submit"
      disabled={scope.isSaving || !scope.isReady || !scope.isDirty}
    >
      {scope.isSaving ? "Saving..." : scope.isDirty ? label : "No changes to save"}
    </button>
  );
}

export function FormDiscardButton({ label = "Discard changes" }: { label?: string } = {}) {
  const scope = useFormScope();
  return (
    <button
      className="workspace-button"
      type="button"
      disabled={scope.isSaving || !scope.isDirty}
      onClick={() => {
        scope.form.reset();
        scope.onChange?.();
        scope.onDiscard?.();
      }}
    >
      {label}
    </button>
  );
}

export function FormFeedback() {
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
}

export const Form = {
  Provider: FormScope,
  Shell: FormShell,
  Fields: FormFields,
  SaveButton: FormSaveButton,
  DiscardButton: FormDiscardButton,
  Feedback: FormFeedback,
};
