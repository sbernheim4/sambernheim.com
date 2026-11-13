import { usePythonEditorContext } from "./PythonEditorContext";

export const PythonEditorToolbar = () => {
  const { title, description, resetSource, tyState } = usePythonEditorContext();

  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="topbar-actions">
        <button type="button" className="reset-button" onClick={resetSource}>
          Reset
        </button>
        <div className={`status-pill ${tyState.status}`} role="status" title={tyState.message}>
          <span>{tyState.status}</span>
          {tyState.version ? <strong>ty {tyState.version}</strong> : null}
        </div>
      </div>
    </header>
  );
};
