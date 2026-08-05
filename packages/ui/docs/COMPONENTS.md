# @pergon/ui — Component Catalog

Fuente única de primitives del Design System PerGon OS.
Tokens: `src/globals.css` + `src/tokens` + Tailwind preset `@pergon/config/tailwind`.
Reglas: `docs/UI_UX_PRINCIPLES.md`, `.cursor/rules/02-ui.mdc`, `04-components.mdc`, `05-animations.mdc`.

## Tokens

| Grupo                       | Ubicación                                                          |
| --------------------------- | ------------------------------------------------------------------ |
| Color light/dark + semantic | `globals.css` (`--primary`, `--success`, `--warning`, `--info`, …) |
| Typography scale            | `--font-size-*`, `--line-height-*`                                 |
| Spacing                     | `--space-*` (base 4)                                               |
| Radius / border / shadow    | `--radius-*`, `--shadow-*`                                         |
| Motion                      | `--duration-*`, `--ease-*`                                         |
| Z-index                     | `--z-*`                                                            |
| Layout                      | `--container-*`, `--sidebar-*`, `--navbar-height`, `--grid-gutter` |
| Charts                      | `--chart-1` … `--chart-5`                                          |

Import: `import "@pergon/ui/globals.css"` + `ThemeProvider`.

## Components

| Component                     | Import                             | Client? | Notes                      |
| ----------------------------- | ---------------------------------- | ------- | -------------------------- |
| Button                        | `@pergon/ui` / `components/button` | No*     | variants + sizes + asChild |
| Input                         | `components/input`                 | No      | focus ring system          |
| Textarea                      | `components/textarea`              | No      |                            |
| Label                         | `components/label`                 | Yes     | Radix Label                |
| Select                        | `components/select`                | Yes     |                            |
| Checkbox                      | `components/checkbox`              | Yes     |                            |
| Switch                        | `components/switch`                | Yes     |                            |
| RadioGroup                    | `components/radio-group`           | Yes     |                            |
| Card                          | `components/card`                  | No      | opt-in surface             |
| Dialog                        | `components/dialog`                | Yes     | z-modal                    |
| Drawer                        | `components/drawer`                | Yes     | Vaul                       |
| Popover                       | `components/popover`               | Yes     |                            |
| Tooltip                       | `components/tooltip`               | Yes     | z-tooltip                  |
| DropdownMenu                  | `components/dropdown-menu`         | Yes     | z-dropdown                 |
| Tabs                          | `components/tabs`                  | Yes     |                            |
| Accordion                     | `components/accordion`             | Yes     |                            |
| Avatar                        | `components/avatar`                | Yes     |                            |
| Badge                         | `components/badge`                 | No      | + semantic variants        |
| Alert                         | `components/alert`                 | No      |                            |
| Toast / Toaster               | `components/toast`, `toaster`      | Yes     | Sonner + theme             |
| Table                         | `components/table`                 | No      |                            |
| DataTable                     | `components/data-table`            | Yes     | presentational only        |
| Pagination                    | `components/pagination`            | No      |                            |
| Breadcrumb                    | `components/breadcrumb`            | No      |                            |
| Navbar                        | `components/navbar`                | No      | chrome shell               |
| Sidebar                       | `components/sidebar`               | Yes     | collapsible                |
| Command                       | `components/command`               | Yes     | cmdk                       |
| SearchInput                   | `components/search`                | Yes     |                            |
| Calendar                      | `components/calendar`              | No*     | DayPicker                  |
| DatePicker                    | `components/date-picker`           | Yes     |                            |
| LoadingSpinner / LoadingBlock | `components/loading`               | No      |                            |
| Skeleton                      | `components/skeleton`              | No      |                            |
| EmptyState                    | `components/empty-state`           | No      |                            |
| ErrorState                    | `components/error-state`           | No      |                            |
| Charts base                   | `components/charts`                | Yes     | recharts                   |
| StatCard                      | `components/stat-card`             | No      | Admin metrics              |
| MetricCard                    | `components/metric-card`           | No      |                            |
| Section                       | `components/section`               | No      |                            |
| Container                     | `components/container`             | No      |                            |
| QrViewer                      | `components/qr-viewer`             | No      | presentation               |
| PassportBadge                 | `components/passport-badge`        | No      |                            |
| StatusBadge                   | `components/status-badge`          | No      |                            |

\* Sin hooks; seguro en RSC si el consumidor no pasa handlers de evento desde Server Components sin boundary.

## A11y / Motion / Dark

- Controles: `cursor-pointer`, hover, `focus-visible`, disabled.
- Overlays: focus trap vía Radix/Vaul.
- `prefers-reduced-motion` global en `globals.css`.
- Dark: clase `.dark` vía `ThemeProvider` (next-themes).

## Storybook

No incluido en Fase 4 (overhead monorepo). Este catálogo + exports tipados son la documentación canónica. Añadir Storybook cuando se necesiten demos interactivos de design QA.

## Prohibido

- Duplicar primitives en apps.
- Hex / spacing / radius fuera de tokens.
- Cards en heroes Web.
- Paletas AI-default (púrpura/indigo, cream+terracotta).
