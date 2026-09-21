import { useContext } from "react";
import { EditContext } from "../context";

export const useIsEditing = () => useContext(EditContext).isEditing;
