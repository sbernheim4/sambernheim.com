import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorTools = ({ children, className }: FormEditorRegionProps) => (
  <div className={className ?? "form-editor-tools"}>{children}</div>
);
