import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Box, Text } from "ink";
import { useEffect } from "react";
import { useFieldContext, useFormContext } from "../../../context";
import { useFieldFocus } from "./FieldFocus";
import type {
  AutocompleteFieldProps,
  RadioGroupFieldProps,
  SelectFieldProps,
  SubmitButtonProps,
  TextFieldProps,
} from "../types";

const ErrorText = ({ errors }: { errors: unknown[] }) => {
  return errors.length ? <Text color="red">{errors.map(String).join(", ")}</Text> : null;
};
const useBlurOnExit = (focused: boolean, onBlur: () => void) => {
  useEffect(() => {
    if (!focused) {
      return;
    }
    return () => {
      onBlur();
    };
  }, [focused, onBlur]);
};
const useTextInput = (
  focused: boolean,
  value: string,
  update: (value: string) => void,
  next: () => void,
) => {
  useTuiInput((input, key) => {
    if (!focused || key.tab) {
      return;
    }
    if (key.return) {
      next();
      return;
    }
    if (key.backspace || key.delete) {
      update(value.slice(0, -1));
      return;
    }
    if (
      input &&
      !key.ctrl &&
      !key.meta &&
      !key.upArrow &&
      !key.downArrow &&
      !key.leftArrow &&
      !key.rightArrow
    ) {
      update(value + input);
    }
  });
};
export const TextField = ({ label, placeholder, required, onChange }: TextFieldProps) => {
  const field = useFieldContext<string>();
  const { focused, next, ref } = useFieldFocus(true, true);
  const value = String(field.state.value ?? "");
  useBlurOnExit(focused, field.handleBlur);
  useTextInput(
    focused,
    value,
    (nextValue) => {
      field.handleChange(nextValue);
      onChange?.(nextValue);
    },
    next,
  );
  return (
    <Box ref={ref} flexDirection="column">
      <Text inverse={focused}>
        {label}
        {required ? " *" : ""}: {value || <Text dimColor>{placeholder || "—"}</Text>}
      </Text>
      <ErrorText errors={field.state.meta.errors} />
    </Box>
  );
};
export const SelectField = <TValue extends string>({
  label,
  options,
  placeholder,
  onChange,
}: SelectFieldProps<TValue>) => {
  const field = useFieldContext<TValue | "">();
  const { focused, next, ref } = useFieldFocus(true, true);
  useBlurOnExit(focused, field.handleBlur);
  const selected = options.findIndex((option) => {
    return option.value === field.state.value;
  });
  useTuiInput((input, key) => {
    if (!focused || key.tab) {
      return;
    }
    if (key.return) {
      next();
      return;
    }
    if (!key.upArrow && !key.downArrow && input !== "h" && input !== "l") {
      return;
    }
    const index =
      (selected + (key.upArrow || input === "h" ? -1 : 1) + options.length) % options.length;
    const value = options[index]?.value;
    if (value !== undefined) {
      field.handleChange(value);
      onChange?.(value);
    }
  });
  const selectedLabel = options[selected]?.label ?? placeholder ?? "Select option";
  return (
    <Box ref={ref} flexDirection="column">
      <Text inverse={focused}>
        {label}: {selectedLabel}
        {focused ? " · ↑/↓ choose" : ""}
      </Text>
      <ErrorText errors={field.state.meta.errors} />
    </Box>
  );
};
export const AutocompleteField = <TValue extends string>({
  label,
  options,
  placeholder,
}: AutocompleteFieldProps<TValue>) => {
  const field = useFieldContext<TValue>();
  const { focused, next, ref } = useFieldFocus(true, true);
  const value = String(field.state.value ?? "");
  useBlurOnExit(focused, field.handleBlur);
  useTextInput(
    focused,
    value,
    (nextValue) => {
      field.handleChange(nextValue as TValue);
    },
    next,
  );
  useTuiInput((_, key) => {
    if (!focused || options.length === 0 || (!key.upArrow && !key.downArrow)) {
      return;
    }
    const selected = options.findIndex((option) => {
      return option.value === field.state.value;
    });
    const index = (selected + (key.upArrow ? -1 : 1) + options.length) % options.length;
    const option = options[index];
    if (option) {
      field.handleChange(option.value);
    }
  });
  const suggestions = options
    .filter((option) => {
      return (
        option.label.toLowerCase().includes(value.toLowerCase()) ||
        option.value.toLowerCase().includes(value.toLowerCase())
      );
    })
    .slice(0, 3);
  return (
    <Box ref={ref} flexDirection="column">
      <Text inverse={focused}>
        {label}: {value || <Text dimColor>{placeholder || "—"}</Text>}
      </Text>
      {focused && suggestions.length > 0 && (
        <Text dimColor>
          {suggestions
            .map((option) => {
              return option.value;
            })
            .join(" · ")}
        </Text>
      )}
      <ErrorText errors={field.state.meta.errors} />
    </Box>
  );
};
export const RadioGroupField = <TValue extends string>({
  label,
  options,
  onChange,
}: RadioGroupFieldProps<TValue>) => {
  const field = useFieldContext<TValue>();
  const { focused, next, ref } = useFieldFocus(true, true);
  useBlurOnExit(focused, field.handleBlur);
  const selected = options.findIndex((option) => {
    return option.value === field.state.value;
  });
  useTuiInput((input, key) => {
    if (!focused || key.tab) {
      return;
    }
    if (key.return) {
      next();
      return;
    }
    if (!key.leftArrow && !key.rightArrow && input !== "h" && input !== "l") {
      return;
    }
    const index =
      (selected + (key.leftArrow || input === "h" ? -1 : 1) + options.length) % options.length;
    const value = options[index]?.value;
    if (value !== undefined) {
      field.handleChange(value);
      onChange?.(value);
    }
  });
  return (
    <Box ref={ref} flexDirection="column">
      <Text inverse={focused}>
        {label}: {options[selected]?.label ?? "—"}
        {focused ? " · ←/→ choose" : ""}
      </Text>
      <ErrorText errors={field.state.meta.errors} />
    </Box>
  );
};
export const SubmitButton = ({ label, isSaving }: SubmitButtonProps) => {
  const form = useFormContext();
  const { focused, ref } = useFieldFocus();
  useTuiInput((_, key) => {
    if (focused && key.return && !isSaving) {
      void form.handleSubmit();
    }
  });
  return (
    <Box ref={ref}>
      <Text color={isSaving ? "gray" : "green"} inverse={focused}>
        {isSaving ? "Saving..." : label}
      </Text>
    </Box>
  );
};
