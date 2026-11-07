import type { FormEditorRegionProps } from "./formTypes";

export const FormEditorLayout = ({ children, className }: FormEditorRegionProps) => {
  return <section className={className ?? "form-editor-layout"}>{children}</section>;
};
