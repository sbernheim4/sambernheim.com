import * as RadioGroup from '@radix-ui/react-radio-group'
import * as Select from '@radix-ui/react-select'
import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFieldContext } from '../context'

type Option<TValue extends string = string> = {
  value: TValue
  label: string
}

export function TextField({
  label,
  placeholder,
  required,
}: {
  label: string
  placeholder?: string
  required?: boolean
}) {
  const field = useFieldContext<string>()

  return (
    <label className="app-field">
      <span>{label}</span>
      <input
        aria-invalid={field.state.meta.errors.length > 0}
        required={required}
        value={field.state.value ?? ''}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {field.state.meta.errors.length > 0 && (
        <span className="form-error" role="alert">
          {field.state.meta.errors.map(String).join(', ')}
        </span>
      )}
    </label>
  )
}

export function SelectField<TValue extends string>({
  label,
  options,
  placeholder = 'Select option',
  onValueChange,
}: {
  label: string
  options: ReadonlyArray<Option<TValue>>
  placeholder?: string
  onValueChange?: (value: TValue) => void
}) {
  const field = useFieldContext<TValue | ''>()
  const labelId = useId()

  return (
    <div className="app-field">
      <span id={labelId}>{label}</span>
      <Select.Root
        value={field.state.value ?? ''}
        onValueChange={(value) => {
          field.handleChange(value as TValue)
          onValueChange?.(value as TValue)
        }}
      >
        <Select.Trigger
          aria-labelledby={labelId}
          className="app-select-trigger"
          onBlur={field.handleBlur}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon className="app-select-icon">
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="app-select-content"
            position="popper"
            sideOffset={4}
          >
            <Select.Viewport>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="app-select-item"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}

export function RadioGroupField<TValue extends string>({
  label,
  options,
}: {
  label: string
  options: ReadonlyArray<Option<TValue>>
}) {
  const field = useFieldContext<TValue>()
  const labelId = useId()

  return (
    <fieldset className="app-radio-group">
      <legend id={labelId}>{label}</legend>
      <RadioGroup.Root
        aria-labelledby={labelId}
        name={field.name}
        onBlur={field.handleBlur}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value as TValue)}
      >
        {options.map((option) => (
          <label key={option.value} className="app-radio-option">
            <RadioGroup.Item value={option.value} className="app-radio-item">
              <RadioGroup.Indicator className="app-radio-indicator" />
            </RadioGroup.Item>
            <span>{option.label}</span>
          </label>
        ))}
      </RadioGroup.Root>
    </fieldset>
  )
}

export function SubmitButton({
  label,
  isSaving,
}: {
  label: string
  isSaving: boolean
}) {
  return (
    <button type="submit" className="primary-action" disabled={isSaving}>
      {isSaving ? 'Saving...' : label}
    </button>
  )
}
