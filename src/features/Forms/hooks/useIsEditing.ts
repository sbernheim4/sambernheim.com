import { useContext } from "react";
import { EditContext } from "../context";

export const useIsEditing = () => {
  return useContext(EditContext).isEditing;
};
