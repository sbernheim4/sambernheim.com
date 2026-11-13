export const catalog = [
  {
    id: "commands",
    name: "Command palette",
    group: "Interaction",
    api: "CommandPalette",
    description:
      "The page’s live command registry supplies the same actions to the page palette and these previews. One useCommandPaletteModel instance handles search, ordering, selection, and execution for both renderers.",
    web: "Search commands, use ↑ / ↓ to highlight one, and press Enter to run. You can also click a command.",
    terminal:
      "Click the terminal. Press / to search, ↑ / ↓ to select, and Enter to run. Esc returns to navigation mode.",
    note: "CommandPalette come from the page’s live registry. Running a command invokes its real page action. Search and selection are shared between these previews and remain separate from the page’s modal palette.",
    props: [
      [
        "model",
        "CommandPaletteModel?",
        "Optional model override; defaults to the shared model supplied by ComponentRendererProvider.",
      ],
      ["mode", "inline | modal = inline", "The same display mode API in either renderer."],
    ],
    example: "<CommandPalette />",
  },
  {
    id: "table",
    name: "Table",
    group: "Display",
    api: "Table",
    description:
      "One useTableModel instance owns filtering and a single TanStack Table instance. Both renderers receive the same table, row model, sorting state, and selection.",
    web: "Filter rows, click a column heading to sort, and click a record name to select it. Column filters applied in the terminal also filter these rows.",
    terminal:
      "Click the terminal. Press / to filter all rows, Alt+1 / Alt+2 / Alt+3 to filter Name / Status / Details, Enter to finish typing, ↑ / ↓ to select, and 1 / 2 / 3 to sort.",
    note: "Sorting cycles ascending, descending, and unsorted. Global and column filters combine through the same TanStack Table model. Filtering clears selection. Row IDs keep the selected record linked when the order changes.",
    props: [
      ["model", "TableModel?", "The same headless model instance for both renderers."],
      ["data", "TableRecord[]?", "Records with id, name, status, summary, and href."],
      [
        "controls",
        "TableControls?",
        "Shared query, column filters, sorting, selected ID, and change handlers.",
      ],
      ["onSelect", "(record) => void", "Optional action when a row is activated."],
    ],
    example: "<Table model={model} interactive />",
  },
  {
    id: "text",
    name: "Text field",
    group: "Forms",
    api: "TextField",
    description:
      "A labeled text input backed by a TanStack Form field. Both renderers use the same value, validation state, and change handlers.",
    web: "Type in the input. Blur the field to run blur validation.",
    terminal: "Click the terminal and type. Backspace removes a character; Enter moves focus.",
    note: "Terminal editing appends text and removes from the end; it does not offer a movable text cursor.",
    props: [
      ["label", "string", "Visible field label."],
      ["placeholder", "string?", "Hint when the value is empty."],
      ["required", "boolean?", "Marks the field as required; supply validators on AppField."],
      ["onChange", "(value: string) => void", "Optional callback alongside the form update."],
    ],
    example:
      '<form.AppField name="title">\n  {(field) => <field.TextField label="Title" placeholder="Name your project" />}\n</form.AppField>',
  },
  {
    id: "select",
    name: "Select",
    group: "Forms",
    api: "SelectField",
    description:
      "Choose one value from a finite list. The web uses a Radix select; the terminal cycles through the same options.",
    web: "Open the select, then choose an option with the mouse or arrow keys.",
    terminal: "Click the terminal, then use ↑ / ↓ or h / l to choose.",
    note: "The TUI shows the selected label inline instead of opening a popup.",
    props: [
      ["label", "string", "Visible field label."],
      ["options", "{ value, label }[]", "Available string values and their display labels."],
      ["placeholder", "string?", "Shown before a value is selected."],
      ["onChange", "(value) => void", "Optional selection callback."],
    ],
    example:
      '<form.AppField name="status">\n  {(field) => <field.SelectField label="Status" options={options} />}\n</form.AppField>',
  },
  {
    id: "radio",
    name: "Radio group",
    group: "Forms",
    api: "RadioGroupField",
    description:
      "A single choice with a small set of options. The field stores the same string value in either renderer.",
    web: "Click an option or use arrow keys while the group has focus.",
    terminal: "Click the terminal, then use ← / → or h / l to choose.",
    note: "Web options are all visible; the terminal shows the current option and a keyboard hint.",
    props: [
      ["label", "string", "Group label."],
      ["options", "{ value, label }[]", "The choices to render."],
      ["onChange", "(value) => void", "Optional selection callback."],
    ],
    example:
      '<form.AppField name="status">\n  {(field) => <field.RadioGroupField label="Status" options={options} />}\n</form.AppField>',
  },
  {
    id: "autocomplete",
    name: "Autocomplete",
    group: "Forms",
    api: "AutocompleteField",
    description:
      "Free text with suggested values. Both versions allow typing a custom value or choosing a suggestion.",
    web: "Type to see matching suggestions, or choose a value from the browser’s suggestion list.",
    terminal:
      "Click the terminal and type to filter suggestions. ↑ / ↓ cycles through all options.",
    note: "The TUI displays up to three matching values below the field. Arrow keys cycle the complete option list.",
    props: [
      ["label", "string", "Visible field label."],
      ["options", "{ value, label }[]", "Suggested string values."],
      ["placeholder", "string?", "Hint for an empty input."],
    ],
    example:
      '<form.AppField name="status">\n  {(field) => <field.AutocompleteField label="Status" options={options} />}\n</form.AppField>',
  },
  {
    id: "tabs",
    name: "Detail tabs",
    group: "Structure",
    api: "DetailTabs",
    description:
      "Organize related details into named panels. Both renderers share the selected tab and render the active panel.",
    web: "Click a tab, or focus the tab list and use arrow keys.",
    terminal: "Click the terminal and press h / l to move between panels.",
    note: "Tabs share their values, labels, and content composition. The renderer chooses the elements for each environment.",
    props: [
      ["tabs", "readonly DetailTab[]", "Each tab has value, label, and children."],
      ["value", "string?", "Controlled active tab value."],
      ["onValueChange", "(value: string) => void", "Reports selection changes in either renderer."],
    ],
    example:
      '<DetailTabs value={tab} onValueChange={setTab} tabs={[\n  { value: "overview", label: "Overview", children: content },\n  { value: "activity", label: "Activity", children: activity },\n]} />',
  },
  {
    id: "section",
    name: "Detail section",
    group: "Structure",
    api: "DetailSection",
    description:
      "A labeled content region for detail screens. Use it to give related information a consistent heading and spacing.",
    web: "This example uses a collapsible section. Click its heading to collapse or expand.",
    terminal: "Click the terminal and press Space to collapse or expand both previews.",
    note: "Pass open and onOpenChange to share disclosure state. The terminal supports controlled collapse with Space.",
    props: [
      ["label", "string", "Section heading."],
      ["children", "ReactNode", "Content for the selected renderer."],
      ["showLabel", "boolean = true", "Whether to display the heading."],
      [
        "collapsible",
        "boolean = false",
        "Enables disclosure; terminal disclosure requires controlled state.",
      ],
      ["open", "boolean?", "Controlled disclosure state."],
      ["onOpenChange", "(open: boolean) => void", "Reports disclosure changes."],
    ],
    example:
      '<DetailSection label="Project details" collapsible open={open} onOpenChange={setOpen}>\n  {content}\n</DetailSection>',
  },
  {
    id: "date",
    name: "Cycleable date & time",
    group: "Display",
    api: "CycleableDateTime",
    description:
      "Display one timestamp as UTC, relative time, or local time. Controlled providers share the chosen format between the web and terminal previews.",
    web: "Click the date to cycle formats. The tooltip names the current format.",
    terminal: "Click the terminal and press Enter to cycle UTC → relative → local.",
    note: "Wrap dates in CycleableDateTimeProvider. Web relative labels refresh every 30 seconds; terminal labels refresh when the TUI renders.",
    props: [
      ["value", "Date", "The timestamp to display."],
      ["className", "string? · web", "Additional web styling."],
      ["modes", "CycleableDateTimeMode[]? · web", "Restricts the available web formats."],
    ],
    example:
      '<CycleableDateTimeProvider mode={mode} onModeChange={setMode}>\n  <CycleableDateTime value={new Date("2026-11-13T15:00:00Z")} />\n</CycleableDateTimeProvider>',
  },
] as const;
export type ComponentId = (typeof catalog)[number]["id"];
export const options = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "In progress" },
  { value: "done", label: "Complete" },
];
export const exampleDate = new Date("2026-11-13T15:00:00Z");

export const tableRecords = [
  {
    id: "design",
    name: "Design review",
    status: "Active",
    summary: "Review screens",
    href: "#design",
  },
  {
    id: "release",
    name: "Release notes",
    status: "Planned",
    summary: "Draft changes",
    href: "#release",
  },
  {
    id: "tests",
    name: "Add tests",
    status: "Complete",
    summary: "Cover key flows",
    href: "#tests",
  },
];
