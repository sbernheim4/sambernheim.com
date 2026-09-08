import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorContent = ({ children, className }: FormEditorRegionProps) => (
  <div className={className ?? "form-editor-content"}>{children}</div>
);
