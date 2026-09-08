import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorMain = ({ children, className }: FormEditorRegionProps) => (
  <main className={className ?? "form-editor-main"}>{children}</main>
);
