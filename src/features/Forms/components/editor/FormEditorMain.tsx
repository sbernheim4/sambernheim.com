import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorMain = ({ children, className }: FormEditorRegionProps) => {
  return <main className={className ?? "form-editor-main"}>{children}</main>;
};
