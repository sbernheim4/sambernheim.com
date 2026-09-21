import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorTools = ({ children, className }: FormEditorRegionProps) => {
  return <div className={className ?? "form-editor-tools"}>{children}</div>;
};
