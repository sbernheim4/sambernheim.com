import { useFormEditorContext } from "../hooks/useFormEditorContext";

export const FormEditorError = () => {
  const { actions } = useFormEditorContext();
  const errors = [...(actions.validationErrors ?? []), ...(actions.submitErrors ?? [])];
  if (!errors.length) {
    return null;
  }
  return (
    <div className="form-editor-error" role="alert">
      {errors.map((error, index) => {
        return <p key={index}>{String(error)}</p>;
      })}
    </div>
  );
};
