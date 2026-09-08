import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorHeader = ({ children, className }: FormEditorRegionProps) => (
  <header className={className ?? "form-editor-header"}>{children}</header>
);
