import "./Diagnostics.css";

export type EditorDiagnostic = {
  code?: string | number;
  severity: "error" | "warning" | "info";
  startLineNumber: number;
  startColumn: number;
  message: string;
};

export const Diagnostics = <T extends EditorDiagnostic>({
  diagnostics,
  onSelect,
  emptyMessage = "No issues reported.",
  error = false,
}: {
  diagnostics: readonly T[];
  onSelect: (diagnostic: T) => void;
  emptyMessage?: string;
  error?: boolean;
}) => {
  return (
    <section className="diagnostics-panel editor-diagnostics" aria-label="Diagnostics">
      <div className="diagnostics-header">
        <h2>Diagnostics</h2>
        <span>{diagnostics.length}</span>
      </div>
      {diagnostics.length === 0 ? (
        <p className="diagnostics-empty" role={error ? "alert" : "status"}>
          {emptyMessage}
        </p>
      ) : (
        <ul className="diagnostics-list">
          {diagnostics.map((diagnostic, index) => {
            return (
              <li key={`${diagnostic.code}-${diagnostic.startLineNumber}-${index}`}>
                <button
                  type="button"
                  className="diagnostic-button"
                  onClick={() => {
                    onSelect(diagnostic);
                  }}
                >
                  <span className={`diagnostic-severity ${diagnostic.severity}`}>
                    {diagnostic.severity}
                  </span>
                  <span className="diagnostic-location">
                    {diagnostic.startLineNumber}:{diagnostic.startColumn}
                  </span>
                  <span>{diagnostic.message}</span>
                  {diagnostic.code !== undefined && <code>{diagnostic.code}</code>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
