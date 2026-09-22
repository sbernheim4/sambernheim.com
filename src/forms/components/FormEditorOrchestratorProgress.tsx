import type { FormEditorOrchestrator } from "../hooks/useFormEditorContext";
import { useFormEditorContext } from "../hooks/useFormEditorContext";
import { CycleableDateTime } from "./CycleableDateTime";
import "./FormEditorOrchestratorProgress.css";

type ProgressStatus = "pending" | "active" | "complete" | "skipped" | "failed";
type ProgressPhase = "validating" | "saving" | "refreshing" | "reconciling" | "effects";

const phases: readonly ProgressPhase[] = [
  "validating",
  "saving",
  "refreshing",
  "reconciling",
  "effects",
];

const titleForId = (id: string) => {
  return id.charAt(0).toUpperCase() + id.slice(1);
};

const getStatusLabel = (status: ProgressStatus) => {
  if (status === "complete") {
    return "✓";
  }

  if (status === "skipped") {
    return "⊘";
  }

  if (status === "failed") {
    return "!";
  }

  if (status === "active") {
    return "";
  }

  return "○";
};

const getStatusTitle = (status: ProgressStatus) => {
  if (status === "complete") {
    return "Successful";
  }

  if (status === "skipped") {
    return "Skipped";
  }

  if (status === "failed") {
    return "Failed";
  }

  if (status === "active") {
    return "In progress";
  }

  return "Waiting";
};

const getPhaseStatus = (currentPhase: string, phase: ProgressPhase): ProgressStatus => {
  if (currentPhase === "complete") {
    return "complete";
  }

  if (currentPhase === phase) {
    return "active";
  }

  const currentIndex = phases.indexOf(currentPhase as ProgressPhase);
  const phaseIndex = phases.indexOf(phase);

  if (currentIndex > phaseIndex) {
    return "complete";
  }

  return "pending";
};

const getFormStatus = (
  orchestrator: FormEditorOrchestrator,
  formId: string,
  phase: ProgressPhase,
): ProgressStatus => {
  const form = orchestrator.result?.forms[formId];

  if (!form) {
    if (orchestrator.result) {
      return "skipped";
    }

    return "pending";
  }

  if (form.status === "saved") {
    return "complete";
  }

  if (form.status === "skipped") {
    return "skipped";
  }

  if (form.status === "failed" || form.status === "invalid") {
    return "failed";
  }

  if (phase === "validating") {
    if (form.status === "validating") {
      return "active";
    }

    if (form.status === "ready" || form.status === "saving" || form.status === "retrying") {
      return "complete";
    }
  }

  if (phase === "saving") {
    if (form.status === "saving" || form.status === "retrying") {
      return "active";
    }

    if (form.status === "validating" || form.status === "ready") {
      return "pending";
    }
  }

  return "pending";
};

const getGroupStatus = (
  currentPhase: string,
  phase: ProgressPhase,
  childStatuses: readonly ProgressStatus[] = [],
): ProgressStatus => {
  if (
    childStatuses.some((status) => {
      return status === "failed";
    })
  ) {
    return "failed";
  }

  if (
    childStatuses.length > 0 &&
    childStatuses.every((status) => {
      return status === "skipped";
    })
  ) {
    return "skipped";
  }

  if (
    childStatuses.length > 0 &&
    childStatuses.every((status) => {
      return status === "complete";
    })
  ) {
    return "complete";
  }

  return getPhaseStatus(currentPhase, phase);
};

const queryKeyLabel = (queryKey: readonly unknown[]) => {
  return queryKey.map(String).join(" / ");
};

const errorLabel = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

const ProgressStep = ({
  label,
  detail,
  status,
  nested = false,
  element = "li",
}: {
  label: string;
  detail: string;
  status: ProgressStatus;
  nested?: boolean;
  element?: "li" | "div";
}) => {
  const Element = element;
  return (
    <Element
      className={nested ? "form-editor-orchestrator-child" : "form-editor-orchestrator-step"}
      data-status={status}
    >
      <span className="form-editor-orchestrator-indicator" aria-hidden="true" />
      <div className="form-editor-orchestrator-copy">
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <span
        className="form-editor-orchestrator-status"
        aria-label={getStatusTitle(status)}
        data-status={status}
        title={getStatusTitle(status)}
      >
        {getStatusLabel(status)}
      </span>
    </Element>
  );
};

const FormStepList = ({
  orchestrator,
  phase,
}: {
  orchestrator: FormEditorOrchestrator;
  phase: ProgressPhase;
}) => {
  return (
    <ol className="form-editor-orchestrator-children">
      {orchestrator.forms.map((form) => {
        const status = getFormStatus(orchestrator, form.id, phase);
        const state = orchestrator.result?.forms[form.id];
        const diagnostic = state?.failure
          ? `Attempts: ${state.attempts} · ${state.failure.phase}: ${errorLabel(state.failure.error)}`
          : state?.blockedBy?.length
            ? `Blocked by: ${state.blockedBy.join(", ")}`
            : phase === "validating"
              ? "Validate fields and prepare payload"
              : `Attempts: ${state?.attempts ?? 0} · Refetches: ${form.refetchCount} · Invalidations: ${form.invalidateQueryKeys.length}`;
        const detail =
          phase === "validating" && !state?.failure && !state?.blockedBy?.length
            ? "Validate fields and prepare payload"
            : diagnostic;

        return (
          <ProgressStep
            key={`${phase}-${form.id}`}
            label={titleForId(form.id)}
            detail={detail}
            status={status}
            nested
          />
        );
      })}
    </ol>
  );
};

export const FormEditorOrchestratorProgress = () => {
  const { actions } = useFormEditorContext();
  const orchestrator = actions.orchestrator;

  if (!orchestrator || !orchestrator.isOpen) {
    return null;
  }

  const validationStatuses = orchestrator.forms.map((form) => {
    return getFormStatus(orchestrator, form.id, "validating");
  });
  const savingStatuses = orchestrator.forms.map((form) => {
    return getFormStatus(orchestrator, form.id, "saving");
  });
  const validationStatus = getGroupStatus(orchestrator.phase, "validating", validationStatuses);
  const savingStatus = getGroupStatus(orchestrator.phase, "saving", savingStatuses);
  const isFinished = orchestrator.phase === "complete";

  return (
    <section className="form-editor-orchestrator" aria-live="polite">
      <div className="form-editor-orchestrator-heading">
        <div>
          <span className="form-editor-orchestrator-eyebrow">Developer view</span>
          <h2>Form orchestration</h2>
        </div>
        <div className="form-editor-orchestrator-heading-actions">
          <span className="form-editor-orchestrator-phase">{orchestrator.phase}</span>
          {isFinished && (
            <button type="button" onClick={orchestrator.close}>
              Close
            </button>
          )}
        </div>
      </div>
      <div className="form-editor-orchestrator-diagnostics" data-testid="orchestrator-diagnostics">
        <span title={orchestrator.correlationId}>
          Run: <code>{orchestrator.correlationId}</code>
        </span>
        <span>
          Updated: <CycleableDateTime value={orchestrator.timestamp} />
        </span>
        {orchestrator.result && orchestrator.result.followUpErrors.length > 0 && (
          <details>
            <summary>{orchestrator.result.followUpErrors.length} follow-up error(s)</summary>
            <ul>
              {orchestrator.result.followUpErrors.map((error, index) => {
                return (
                  <li key={`${error.phase}-${error.formId ?? "run"}-${index}`}>
                    {error.formId ? `${error.formId}: ` : ""}
                    {error.phase}: {errorLabel(error.error)}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </div>
      <ol className="form-editor-orchestrator-steps">
        <li className="form-editor-orchestrator-group" data-status={validationStatus}>
          <ProgressStep
            label="Validate forms"
            detail="Check fields and prepare dependent payloads"
            status={validationStatus}
            element="div"
          />
          <FormStepList orchestrator={orchestrator} phase="validating" />
        </li>
        <li className="form-editor-orchestrator-group" data-status={savingStatus}>
          <ProgressStep
            label="Save forms"
            detail="Submit each form in dependency order"
            status={savingStatus}
            element="div"
          />
          <FormStepList orchestrator={orchestrator} phase="saving" />
        </li>
        <li>
          <ProgressStep
            label="Refresh and invalidate queries"
            detail={orchestrator.forms
              .map((form) => {
                const keys = form.invalidateQueryKeys
                  .map((queryKey) => {
                    return queryKeyLabel(queryKey);
                  })
                  .join(", ");
                return `${titleForId(form.id)}: ${keys || "no query keys"}`;
              })
              .join(" · ")}
            status={getPhaseStatus(orchestrator.phase, "refreshing")}
            element="div"
          />
        </li>
        <li>
          <ProgressStep
            label="Reconcile query cache"
            detail={orchestrator.forms
              .map((form) => {
                return `${titleForId(form.id)}: ${form.cacheUpdateCount} cache update(s)`;
              })
              .join(" · ")}
            status={getPhaseStatus(orchestrator.phase, "reconciling")}
            element="div"
          />
        </li>
        <li>
          <ProgressStep
            label="Finish orchestration"
            detail="Mark forms saved, clear drafts, and run success effects"
            status={getPhaseStatus(orchestrator.phase, "effects")}
            element="div"
          />
        </li>
      </ol>
    </section>
  );
};

export const FormEditorOrchestratorStatus = () => {
  const { actions } = useFormEditorContext();
  const orchestrator = actions.orchestrator;

  if (!orchestrator || !orchestrator.isOpen) {
    return null;
  }

  return (
    <div className="form-editor-orchestrator-status-bar" aria-live="polite">
      <span>
        {orchestrator.phase === "complete" ? "Form changes saved" : "Saving form changes…"}
      </span>
      {orchestrator.phase === "complete" && (
        <button type="button" onClick={orchestrator.close}>
          Dismiss
        </button>
      )}
    </div>
  );
};
