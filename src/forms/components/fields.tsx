import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Select from "@radix-ui/react-select";
import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { useFieldContext } from "../context";

type Option<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export const TextField = ({
  label,
  placeholder,
  required,
  onChange,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}) => {
  const field = useFieldContext<string>();

  return (
    <label className="app-field">
      <span>{label}</span>
      <input
        aria-invalid={field.state.meta.errors.length > 0}
        required={required}
        value={field.state.value ?? ""}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(event) => {
          const value = event.target.value;
          field.handleChange(value);
          onChange?.(value);
        }}
      />
      {field.state.meta.errors.length > 0 && (
        <span className="form-error" role="alert">
          {field.state.meta.errors.map(String).join(", ")}
        </span>
      )}
    </label>
  );
};

export const SelectField = <TValue extends string>({
  label,
  options,
  placeholder = "Select option",
  onChange,
}: {
  label: string;
  options: ReadonlyArray<Option<TValue>>;
  placeholder?: string;
  onChange?: (value: TValue) => void;
}) => {
  const field = useFieldContext<TValue | "">();
  const labelId = useId();
  const selectedOption = options.find((option) => {
    return option.value === field.state.value;
  });

  return (
    <div className="app-field">
      <span id={labelId}>{label}</span>
      <Select.Root
        value={field.state.value ?? ""}
        onValueChange={(value) => {
          const typedValue = value as TValue;
          field.handleChange(typedValue);
          onChange?.(typedValue);
        }}
      >
        <Select.Trigger
          aria-labelledby={labelId}
          className="app-select-trigger"
          onBlur={field.handleBlur}
        >
          <Select.Value placeholder={placeholder}>{selectedOption?.label}</Select.Value>
          <Select.Icon className="app-select-icon">
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="app-select-content" position="popper" sideOffset={4}>
            <Select.Viewport>
              {options.map((option) => {
                return (
                  <Select.Item key={option.value} value={option.value} className="app-select-item">
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                );
              })}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export const AutocompleteField = <TValue extends string>({
  label,
  options,
  placeholder,
}: {
  label: string;
  options: ReadonlyArray<Option<TValue>>;
  placeholder?: string;
}) => {
  const field = useFieldContext<TValue>();
  const listId = useId();

  return (
    <label className="app-field">
      <span>{label}</span>
      <input
        aria-invalid={field.state.meta.errors.length > 0}
        value={field.state.value ?? ""}
        placeholder={placeholder}
        list={listId}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value as TValue);
        }}
      />
      <datalist id={listId}>
        {options.map((option) => {
          return <option key={option.value} value={option.value} label={option.label} />;
        })}
      </datalist>
      {field.state.meta.errors.length > 0 && (
        <span className="form-error" role="alert">
          {field.state.meta.errors.map(String).join(", ")}
        </span>
      )}
    </label>
  );
};

export const RadioGroupField = <TValue extends string>({
  label,
  options,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<Option<TValue>>;
  onChange?: (value: TValue) => void;
}) => {
  const field = useFieldContext<TValue>();
  const labelId = useId();

  return (
    <fieldset className="app-radio-group">
      <legend id={labelId}>{label}</legend>
      <RadioGroup.Root
        aria-labelledby={labelId}
        name={field.name}
        onBlur={field.handleBlur}
        value={field.state.value}
        onValueChange={(value) => {
          const typedValue = value as TValue;
          field.handleChange(typedValue);
          onChange?.(typedValue);
        }}
      >
        {options.map((option) => {
          return (
            <label key={option.value} className="app-radio-option">
              <RadioGroup.Item value={option.value} className="app-radio-item">
                <RadioGroup.Indicator className="app-radio-indicator" />
              </RadioGroup.Item>
              <span>{option.label}</span>
            </label>
          );
        })}
      </RadioGroup.Root>
    </fieldset>
  );
};

export const SubmitButton = ({ label, isSaving }: { label: string; isSaving: boolean }) => {
  return (
    <button type="submit" className="primary-action" disabled={isSaving}>
      {isSaving ? "Saving..." : label}
    </button>
  );
};
