import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorHeader = ({ children, className }: FormEditorRegionProps) => {
  return <header className={className ?? "form-editor-header"}>{children}</header>;
};
