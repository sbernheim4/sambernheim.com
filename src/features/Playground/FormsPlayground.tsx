import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useComposableForm } from "@/features/Forms/hooks/useComposableForm";
import { useFormOrchestrator } from "@/features/Forms/hooks/useFormOrchestrator";
import { useDependentField } from "@/features/Forms/hooks/useDependentField";
import { FormEditor } from "@/features/Forms/components";
import { FieldPrimitivesContext } from "@/features/Forms/components/fields";
import { webFieldPrimitives } from "@/features/Forms/components/fields/web";
import { clearFormUndoTransaction } from "@/features/Forms/orchestration/undoStore";
import "./forms-playground.css";

type Workshop = { id: string; name: string; track: string };
type Registration = {
  id: string;
  workshopId: string;
  attendee: string;
  email: string;
  session: string;
};

const sessions: Record<string, { value: string; label: string }[]> = {
  python: [
    { value: "typing", label: "Practical Python typing" },
    { value: "async", label: "Async Python" },
  ],
  web: [
    { value: "forms", label: "Composable forms" },
    { value: "accessibility", label: "Accessible interfaces" },
    { value: "performance", label: "Web performance" },
  ],
};
const initialWorkshop: Workshop = {
  id: "workshop-1",
  name: "Build something together",
  track: "python",
};
const initialRegistration: Registration = {
  id: "registration-1",
  workshopId: "workshop-1",
  attendee: "Alex Morgan",
  email: "alex@example.com",
  session: "typing",
};
const requiredName = ({ value }: { value: string }) => {
  return value.trim().length < 2 ? "Use at least two characters." : undefined;
};
const validEmail = ({ value }: { value: string }) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "Enter a valid email address.";
};
const pause = () => {
  return new Promise<void>((resolve) => {
    return setTimeout(resolve, 250);
  });
};

export const FormsPlayground = () => {
  const instance = useId();
  useEffect(() => {
    clearFormUndoTransaction();
    return clearFormUndoTransaction;
  }, []);
  const workshopKey = ["playground", instance, "workshop"];
  const registrationKey = ["playground", instance, "registration"];
  const database = useRef({ workshop: initialWorkshop, registration: initialRegistration });
  const [events, setEvents] = useState<string[]>([]);
  const [failNext, setFailNext] = useState(false);
  const failure = useRef(false);
  const log = (message: string) => {
    return setEvents((previous) => {
      return [...previous.slice(-19), message];
    });
  };
  const workshopQuery = useQuery({
    queryKey: workshopKey,
    queryFn: () => {
      return database.current.workshop;
    },
    initialData: initialWorkshop,
    staleTime: Infinity,
  });
  const registrationQuery = useQuery({
    queryKey: registrationKey,
    queryFn: () => {
      return database.current.registration;
    },
    initialData: initialRegistration,
    staleTime: Infinity,
  });

  const workshop = useComposableForm({
    id: "workshop",
    defaultValues: initialWorkshop,
    query: workshopQuery,
    endpoint: {
      mutationFn: async (input: Workshop) => {
        log("1. PUT /demo/workshop — saving workshop");
        await pause();
        database.current.workshop = { ...input };
        log(`Workshop saved → ${input.id}`);
        return database.current.workshop;
      },
    },
    cacheUpdates: [
      {
        queryKey: () => {
          return workshopKey;
        },
      },
    ],
  });
  const registration = useComposableForm({
    id: "registration",
    defaultValues: initialRegistration,
    query: registrationQuery,
    dependencies: [workshop] as const,
    validate: (values) => {
      return sessions[workshop.form.state.values.track]?.some((session) => {
        return session.value === values.session;
      })
        ? undefined
        : "Choose a session in the workshop's track.";
    },
    endpoint: {
      mutationFn: async (input: Registration) => {
        log(`2. PUT /demo/registration — workshopId: ${input.workshopId}`);
        await pause();
        if (failure.current) {
          failure.current = false;
          setFailNext(false);
          log("Registration failed — simulated endpoint error");
          throw new Error("Registration endpoint is temporarily unavailable. Save again to retry.");
        }
        database.current.registration = { ...input };
        log("Registration saved → query cache updated");
        return database.current.registration;
      },
    },
    toMutationPayload: (values, { results }) => {
      return {
        ...values,
        workshopId: results.workshop?.id ?? values.workshopId,
      };
    },
    cacheUpdates: [
      {
        queryKey: () => {
          return registrationKey;
        },
      },
    ],
  });
  const track = useDependentField({
    source: workshop.form,
    select: (values) => {
      return values.track;
    },
    target: registration.form,
    targetField: "session",
    format: (value, current) => {
      return sessions[value]?.some((session) => {
        return session.value === current;
      })
        ? current
        : (sessions[value]?.[0]?.value ?? "");
    },
  });
  const save = useFormOrchestrator({
    forms: [workshop, registration] as const,
    includePristine: true,
    progressDelayMs: 800,
    onFailure: ({ result }) => {
      if (result.outcome === "validation-failed") {
        log("Validation stopped the save before any endpoint was called.");
      }
    },
  });

  return (
    <section className="playground-page forms-playground">
      <header className="playground-heading">
        <h1>Multiple forms, multiple endpoints.</h1>
        <p>
          Compose forms that submit to multiple endpoints with one button. Control submission order
          so subsequent requests can depend on the values returned by earlier endpoint submissions.
          Control which submissions should cause the query cache to be refetched and write endpoint
          responses directly to the query cache so all parts of your UI referencing that data get
          updated. Never let backend replica lag cause your UI to show data out of sync in your UI
          again. This form system supports Undo by running the mutation function for each endpoint
          with its original data. This example’s requests are simulated in your browser.
        </p>
      </header>
      <FieldPrimitivesContext.Provider value={webFieldPrimitives}>
        <FormEditor.Provider
          mode="edit"
          isEditing
          defaultTab="workshop"
          viewMode="page"
          actions={save.actions}
          showCancel={false}
        >
          <FormEditor.Undo />
          <br />
          <fieldset className="forms-playground-fields" disabled={save.isSaving}>
            <section className="forms-playground-card">
              <span className="forms-playground-label">01 / WORKSHOP</span>
              <h2>Plan the workshop</h2>
              <p>This saves first; its ID is then passed to the registration.</p>
              <workshop.form.AppField
                name="name"
                validators={{ onChange: requiredName, onSubmit: requiredName }}
              >
                {(field) => {
                  return <field.TextField label="Workshop name" />;
                }}
              </workshop.form.AppField>
              <workshop.form.AppField name="track">
                {(field) => {
                  return (
                    <div className="forms-playground-track-picker">
                      <field.RadioGroupField
                        label="Track"
                        options={[
                          { value: "python", label: "Python" },
                          { value: "web", label: "Web engineering" },
                        ]}
                        onChange={track.onChange}
                      />
                    </div>
                  );
                }}
              </workshop.form.AppField>
            </section>
            <section className="forms-playground-card">
              <span className="forms-playground-label">02 / REGISTRATION</span>
              <h2>Reserve a place</h2>
              <p>The available sessions depend on the workshop track.</p>
              <registration.form.AppField
                name="attendee"
                validators={{ onChange: requiredName, onSubmit: requiredName }}
              >
                {(field) => {
                  return <field.TextField label="Attendee name" />;
                }}
              </registration.form.AppField>
              <registration.form.AppField
                name="email"
                validators={{ onChange: validEmail, onSubmit: validEmail }}
              >
                {(field) => {
                  return <field.TextField label="Email" />;
                }}
              </registration.form.AppField>
              <registration.form.AppField name="session">
                {(field) => {
                  return (
                    <field.RadioGroupField
                      key={track.value}
                      label="Session"
                      options={sessions[track.value] ?? []}
                    />
                  );
                }}
              </registration.form.AppField>
            </section>
          </fieldset>
          <div className="forms-playground-controls">
            <label>
              <input
                type="checkbox"
                checked={failNext}
                disabled={save.isSaving}
                onChange={(event) => {
                  failure.current = event.target.checked;
                  setFailNext(event.target.checked);
                }}
              />{" "}
              Fail the next registration save
            </label>
            <div>
              <button
                type="button"
                disabled={save.isSaving}
                onClick={() => {
                  return void save.reset();
                }}
              >
                Reset unsaved changes
              </button>
              <button
                type="submit"
                disabled={save.isSaving || !workshop.isReady || !registration.isReady}
              >
                {save.isSaving ? "Saving…" : "Save workshop and registration"}
              </button>
            </div>
          </div>
          <p role="status" className="forms-playground-status">
            {save.isSaving
              ? `Saving: ${save.phase}`
              : save.result
                ? `Result: ${save.result.outcome.replaceAll("-", " ")}`
                : "Ready when you are."}
          </p>
          {save.result &&
            Object.entries(save.result.forms).map(([id, result]) => {
              return result.failure?.error ? (
                <p key={id} role="alert" className="form-error">
                  {id}:{" "}
                  {result.failure?.error instanceof Error
                    ? result.failure?.error.message
                    : String(result.failure?.error)}
                </p>
              ) : null;
            })}
          <FormEditor.OrchestratorProgress />
          <br />
        </FormEditor.Provider>
      </FieldPrimitivesContext.Provider>
      <div className="forms-playground-results">
        <section className="forms-playground-card">
          <h2>Saved data</h2>
          <p>This is the saved data. Your unsaved edits won’t show up here.</p>
          <pre aria-label="Saved data">
            {JSON.stringify(
              { workshop: workshopQuery.data, registration: registrationQuery.data },
              null,
              2,
            )}
          </pre>
        </section>
        <section className="forms-playground-card">
          <h2>Endpoint activity</h2>
          <p>See which endpoint ran, what happened on failure, and how undo is saved.</p>
          {events.length ? (
            <ol aria-label="Endpoint activity">
              {events.map((event, index) => {
                return <li key={index}>{event}</li>;
              })}
            </ol>
          ) : (
            <p className="forms-playground-empty">
              Nothing has been saved yet. Try the form to see the requests.
            </p>
          )}
        </section>
      </div>
    </section>
  );
};
