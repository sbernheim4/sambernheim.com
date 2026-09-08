import { useContext } from "react";
import { EditContext } from "../EditContext";

export const useIsEditing = () => useContext(EditContext).isEditing;
