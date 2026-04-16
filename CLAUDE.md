# Project Conventions & Patterns

This file documents the architectural decisions, code patterns, and conventions used in this project. When generating code for this project, follow every rule below strictly.

---

## Stack & Key Libraries

| Concern       | Library                                      |
| ------------- | -------------------------------------------- |
| Framework     | Next.js (App Router)                         |
| Language      | TypeScript (strict mode)                     |
| Styling       | Tailwind CSS + `tailwindcss-animate`         |
| Server state  | `@tanstack/react-query` v5                   |
| Forms         | `react-hook-form` + `@hookform/resolvers`    |
| Validation    | `zod`                                        |
| Tables        | `@tanstack/react-table` v8                   |
| HTTP client   | `axios` wrapped in `httpClient`              |
| Notifications | `react-toastify` (via `@/lib/toast` wrapper) |
| Page loader   | `nprogress`                                  |
| Localization  | `next-intl`                                  |
| Icons         | `lucide-react`                               |

Path alias: `@/*` → `./src/*`. Always use `@/` imports.

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — returns children only
│   └── [locale]/
│       ├── layout.tsx              # Locale layout: providers, fonts, html dir
│       ├── page.tsx                # Auth redirect logic
│       ├── (auth-pages)/
│       │   └── [auth-route]/
│       │       └── page.tsx        # e.g. login, register
│       └── (protected)/
│           ├── layout.tsx          # Sidebar + AppHeader
│           └── [domain]/
│               └── page.tsx        # One page per domain
├── assets/fonts/                   # Local .woff2 font files
├── components/
│   ├── forms/                      # FormField, TextareaField
│   ├── modals/
│   │   ├── [domain]/               # Add[Domain]Modal, Edit[Domain]Modal, View[Domain]Modal
│   │   └── ProfileModal.tsx
│   ├── tables/                     # [Domain]Table components
│   └── ui/                         # Reusable primitives (Modal, FormModal, Button, StatusBadge, StatusCard, Spinner, TableSkeleton, ErrorMessage, …)
├── constants/
│   ├── api-endpoints.ts            # All API path strings
│   └── app-config.ts               # App-wide config constants (token name, cookie config, etc.)
├── dictionaries/
│   ├── en.json
│   └── ar.json
├── hooks/
│   ├── useApi.ts                   # React Query wrappers (useApiQuery, useApiMutation)
│   ├── useRouterWithLoader.tsx     # next/navigation router + NProgress
│   └── http/
│       └── use[Domain].ts          # Domain-specific data hooks
├── i18n/request.ts                 # next-intl server config
├── lib/
│   ├── api/
│   │   ├── client.ts               # Axios instance + httpClient helper
│   │   ├── interceptors.ts         # Auth token + Accept-Language injection + 401 handling
│   │   └── error-handler.ts        # extractErrorMessage, handleApiError
│   ├── toast.ts                    # Thin wrapper around react-toastify
│   └── validations/
│       └── [domain].schema.ts      # Zod schemas (factory pattern, accepts `t`)
├── middleware.ts                   # Locale detection, auth guard, JWT expiry check
├── providers/
│   ├── query-provider.tsx          # QueryClientProvider
│   └── toast-provider.tsx          # ToastContainer + global CSS overrides
├── services/
│   └── [domain]-service.ts         # Singleton class, raw API calls
├── types/http/
│   └── [domain].types.ts           # Enums, entity interfaces, DTOs, filters
└── utils/
    └── locale.ts                   # locales array, defaultLocale, Locale type
```

---

## Environment Variables

### Structure

Maintain **two** env files at the project root:

```
.env          # Shared defaults — safe to commit (no secrets)
.env.local    # Local overrides & secrets — never commit (add to .gitignore)
```

For production, environment variables are injected by the hosting platform (e.g. Vercel, Railway). Do **not** create a `.env.production` file with secrets in the repository.

### Naming Rules

- Variables exposed to the browser **must** be prefixed with `NEXT_PUBLIC_`.
- Variables without the prefix are server-only and are never sent to the client bundle.
- Never put secrets or tokens in `NEXT_PUBLIC_` variables.

### Reference Table

Every environment variable used in the project must be listed here. Fill in both files according to this table:

| Variable              | Public? | Used In        | `.env` (default) | `.env.local`                  |
| --------------------- | ------- | -------------- | ---------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL` | ✅      | `axios` client | —                | `http://localhost:[port]/api` |

> When adding a new variable, add it to this table first — specifying which file it belongs in and where it is consumed. If it has a safe non-secret default, put it in `.env`. If it is secret or environment-specific, put the key name here and the value only in `.env.local`.

### Usage

```ts
// Always access via process.env — never hardcode values inline
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Localization

### Setup

- Locale lives in the URL segment: `/[locale]/...`
- Supported locales and default defined in `src/utils/locale.ts`:

```ts
export const locales = ["ar", "en"] as const;
export const defaultLocale = "en";
export type Locale = (typeof locales)[number];
```

- `src/i18n/request.ts` loads the right dictionary and falls back to `defaultLocale`.

### Static generation (required in locale layout)

```ts
export const dynamic = "force-static";
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

### Locale layout obligations

```tsx
// src/app/[locale]/layout.tsx
setRequestLocale(locale); // next-intl server call
const dir = locale === "ar" ? "rtl" : "ltr";
<html lang={locale} dir={dir}>
  {children}
</html>;
```

### Dictionary structure (`en.json` / `ar.json`)

Organize by feature. Never use flat keys:

```json
{
  "common": {
    "save": "",
    "cancel": "",
    "delete": "",
    "edit": "",
    "view": "",
    "actions": "",
    "loading": "",
    "error": "",
    "retry": ""
  },
  "auth": {},
  "sidebar": {},
  "dashboard": {},
  "header": {},
  "profile": {},
  "validation": {},
  "[domain]": {
    "modal": {},
    "table": {},
    "status": {}
  }
}
```

### Client usage

```ts
const t = useTranslations("[domain].modal");
const locale = useLocale();
const isRTL = locale === "ar";
```

### RTL Tailwind classes

Always use logical or directional variants — never hardcode left/right:

```tsx
className = "ltr:right-2 rtl:left-2";
className = "ltr:border-l-4 rtl:border-r-4";
className = "me-2"; // margin-end (RTL-aware)
className = "rtl:scale-x-[-1]"; // flip icons
```

---

## Middleware

### Responsibilities

The middleware (`src/middleware.ts`) is the first line of defense on every request. It handles:

- **Locale enforcement** — detect locale from cookie or `Accept-Language` header; redirect bare routes (e.g. `/`) to the locale-prefixed equivalent
- **Auth guard** — on protected routes: verify the `access_token` cookie exists and has not expired (decode JWT `exp` claim — no signature verification, that is the backend's responsibility)
- **Redirect logic**:
  - Unauthenticated or expired token accessing a protected route → redirect to the designated public auth entry point + **clear the stale cookie**
  - Authenticated user accessing an auth-only route → redirect to the designated protected entry point
- **Token forwarding** — attach the `access_token` as an `Authorization: Bearer` header on every outgoing API request so the backend always receives it

### What middleware does NOT do

- Validate JWT signature (backend responsibility)
- Rate limiting or CORS (infrastructure/backend responsibility)
- Any business logic

### Route Classification

Define protected and public routes explicitly in the middleware. The actual route names are project-specific and must be configured per project — the convention is to declare them as named constants at the top of the middleware file:

```ts
// src/middleware.ts
const PUBLIC_ROUTES = [
  /* auth routes: login, register, etc. */
];
const PROTECTED_ROUTES = [
  /* app routes: any route requiring authentication */
];

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### JWT Expiry Check (no external library needed)

```ts
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat malformed tokens as expired
  }
}
```

### Cookie Clearing on Expiry

```ts
// When the token is expired, clear the cookie before redirecting
const response = NextResponse.redirect(publicAuthEntryUrl);
response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
return response;
```

---

## Authentication & Token Management

### Token Storage

- The access token is stored exclusively in a **cookie**.
- **Never** store the token in `localStorage` or `sessionStorage` — these are inaccessible to middleware and server components, and are vulnerable to XSS.

### Cookie Attributes

```ts
// Set after successful login — in the service layer
document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 15}; SameSite=Lax`;
```

| Attribute  | Value             | Reason                                                   |
| ---------- | ----------------- | -------------------------------------------------------- |
| `path`     | `/`               | Available across all routes                              |
| `max-age`  | Match token TTL   | Persistent across sessions                               |
| `SameSite` | `Lax`             | CSRF protection without breaking normal navigation       |
| `HttpOnly` | ❌ Not set        | Must be readable by the Axios interceptor and middleware |
| `Secure`   | Set in production | Enforces HTTPS in production environments                |

> **Why not `HttpOnly`?** The token must be readable by JavaScript in two places: the Axios interceptor (client-side API calls) and the middleware (route protection + header forwarding). `HttpOnly` would block both. The XSS risk is mitigated by `SameSite=Lax` and by never storing sensitive data beyond the token itself.

### Token Flow

| Layer                 | Responsibility                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Service layer**     | Set cookie on login success; clear cookie on logout                                                                       |
| **Middleware**        | Read cookie → check expiry → forward as `Authorization: Bearer` header on requests → clear cookie and redirect if expired |
| **Axios interceptor** | Read cookie → attach as `Authorization: Bearer` header on all client-side `httpClient` calls                              |

The token is read in exactly two places: the middleware and the Axios interceptor. Nowhere else.

### Session Expiry & 401 Handling

When the backend returns a `401`, the Axios interceptor handles it globally:

```ts
// src/lib/api/interceptors.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the stale token and redirect to the public auth entry point
      document.cookie = `${APP_CONFIG.tokenCookieName}=; path=/; max-age=0`;
      window.location.href = `/${currentLocale}/[auth-entry-route]`;
    }
    return Promise.reject(error);
  },
);
```

- Do **not** handle `401` again in hooks or components — it is a global concern.
- Do **not** attempt token refresh unless the project explicitly implements a refresh token flow — document that separately if needed.

### Rules Summary

- Token is **set and cleared** only in the service layer.
- Token is **read** only in the middleware and the Axios interceptor.
- The current user's profile is fetched via a `/me` (or equivalent) endpoint — never decode the JWT payload to get user data in the UI.

---

## HTTP Layer

### Axios client (`src/lib/api/client.ts`)

```ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});
```

Exported as `httpClient` with typed methods: `.get`, `.post`, `.put`, `.patch`, `.delete`.

### Interceptors (`src/lib/api/interceptors.ts`)

Every request automatically gets:

- `Authorization: Bearer {access_token}` (read from cookie)
- `Accept-Language: {locale}` (read from `NEXT_LOCALE` cookie)

`401` responses are caught here and handled globally (see Authentication section). All other errors propagate to `useApiMutation`'s `onError`.

### API response envelope

All backend responses are wrapped:

```ts
export interface ApiResponse<T> {
  data: T;
}
// Usage: response.data.data
```

### Service layer (`src/services/[domain]-service.ts`)

- One class per domain, exported as a singleton.
- No business logic — only API calls.
- Token/cookie side effects (set/clear) live here.

```ts
"use client";
import { httpClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse, Entity, CreateEntityDto } from "@/types/http/[domain].types";

class EntityService {
  async getAll(): Promise<Entity[]> {
    const res = await httpClient.get<ApiResponse<Entity[]>>(API_ENDPOINTS.[domain].list);
    return res.data.data;
  }

  async create(dto: CreateEntityDto): Promise<Entity> {
    const res = await httpClient.post<ApiResponse<Entity>>(API_ENDPOINTS.[domain].create, dto);
    return res.data.data;
  }
}

export const entityService = new EntityService();
```

> **Why `"use client"` on services?** Services that handle login/logout access `document.cookie` to set or clear the token — a browser-only API. Services that never touch cookies can omit the directive.

### React Query wrappers (`src/hooks/useApi.ts`)

```ts
// Query
export function useApiQuery(queryKey, queryFn, options?);
// Mutation — automatically calls handleApiError on error (shows toast)
export function useApiMutation(mutationFn, options?);
```

### Domain hooks (`src/hooks/http/use[Domain].ts`)

Each mutation/query gets its own named hook. Return values use descriptive names:

```ts
export function useCreateEntity() {
  const queryClient = useQueryClient();
  const t = useTranslations("[domain]");
  const { mutate, isPending } = useApiMutation(
    (dto: CreateEntityDto) => entityService.create(dto),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["[domain]"] });
        toast.success(t("addSuccess"));
      },
    },
  );
  return { createEntityMutate: mutate, createEntityPending: isPending };
}

export function useEntities(filters: EntityFilters) {
  const { data, isLoading, error } = useApiQuery(
    ["[domain]", filters],
    () => entityService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );
  return { entities: data ?? [], isLoading, error };
}
```

**Naming convention for returned values:**

- Mutate fn: `[action][Entity]Mutate` (e.g. `createStudentMutate`)
- Pending flag: `[action][Entity]Pending`
- Error: `[action][Entity]Error`

### QueryClient defaults

```ts
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
}
```

### Error handling

```ts
// src/lib/api/error-handler.ts
export function extractErrorMessage(error: unknown): string { ... }
export function handleApiError(error: unknown): void {
  toast.error(extractErrorMessage(error));
}
```

- Backend error shape: `{ statusCode, error, message: string | string[] }`
- `useApiMutation` calls `handleApiError` automatically — do not repeat in hooks unless custom logic is needed.
- `401` is handled globally in the interceptor — never handle it again in hooks or components.

---

## Constants

### `src/constants/api-endpoints.ts`

All API route strings live here. Never inline path strings in services or hooks:

```ts
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  [domain]: {
    list: "/[domain]",
    create: "/[domain]",
    update: (id: string) => `/[domain]/${id}`,
    delete: (id: string) => `/[domain]/${id}`,
  },
} as const;
```

### `src/constants/app-config.ts`

App-wide configuration values that are not secrets:

```ts
export const APP_CONFIG = {
  tokenCookieName: "access_token",
  localeCookieName: "NEXT_LOCALE",
  tokenMaxAgeDays: 15,
  defaultPageSize: 10,
  toastDuration: 4000,
} as const;
```

Reference `APP_CONFIG` wherever these values are needed — never hardcode them inline anywhere in the codebase.

---

## Client / Server Component Boundary

### General Rule

Prefer **server components** by default. Add `"use client"` only when the component genuinely needs:

- Browser APIs (`window`, `document`, cookies, etc.)
- React state (`useState`, `useReducer`)
- React effects (`useEffect`, `useLayoutEffect`)
- Event handlers (`onClick`, `onChange`, etc.)
- Any hook that internally uses the above

Never add `"use client"` to layout files unless strictly unavoidable. Push the client boundary **as deep and as low** in the component tree as possible so the maximum surface area benefits from server rendering.

### Pattern

A page can be a server component that composes a client component for its interactive parts:

```tsx
// page.tsx — server component (no directive needed)
import { EntityTable } from "@/components/tables/EntityTable"; // has "use client" inside

export default function EntityPage() {
  return <EntityTable />;
}
```

### SEO Consideration

Pages that need to be indexed (public-facing) must remain server components and keep client islands minimal. Pages behind authentication have no SEO requirement and may be fully client-rendered — but the principle of pushing the boundary down still applies for performance.

---

## Loading & Error States

### Loading

Use a **hybrid** approach:

- **Skeleton** — shown on initial data fetch (`isLoading === true`). Use a shared parameterized skeleton component:

```tsx
<TableSkeleton rows={10} columns={5} />
<CardSkeleton count={3} />
```

- **Spinner overlay** — shown while a mutation is pending (saving, deleting, uploading). Overlay the existing UI rather than replacing it:

```tsx
{
  isMutating && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
      <Spinner />
    </div>
  );
}
```

### Error

Use **both** inline UI and toast — they serve different purposes:

- **Toast** — immediate, transient feedback. Already handled automatically by `useApiMutation` via `handleApiError`. Do not add manually unless there is custom logic.
- **Inline `<ErrorMessage />`** — persistent fallback when the page has no data to show. Always includes a **Retry** button:

```tsx
const { entities, isLoading, error, refetch } = useEntities();

if (isLoading) return <TableSkeleton rows={10} columns={5} />;
if (error) return <ErrorMessage onRetry={refetch} />;
```

The `<ErrorMessage />` component must:

- Display a localized generic error message
- Provide a **Retry** button that calls `refetch()`
- Never expose raw error details or stack traces to the user

---

## Forms

### Schema pattern (`src/lib/validations/[domain].schema.ts`)

Schemas are **factory functions** that accept a translation function so error messages are localized:

```ts
import { z } from "zod";

export const createEntitySchema = (
  t: (key: string, opts?: Record<string, unknown>) => string,
) =>
  z.object({
    name: z
      .string()
      .min(1, t("nameRequired"))
      .min(2, t("nameMin", { min: 2 })),
    phone: z
      .string()
      .regex(phoneRegex, t("phoneInvalid"))
      .or(z.literal(""))
      .optional(),
    password: z
      .string()
      .min(8, t("passwordMin", { min: 8 }))
      .regex(passwordRegex, t("passwordFormat")),
  });

export type CreateEntityFormData = z.infer<
  ReturnType<typeof createEntitySchema>
>;
```

### Edit schema pattern

Edit schemas must **derive** from create schemas — never duplicate field definitions:

```ts
// Option A — all fields become optional
export const updateEntitySchema = (t: ...) =>
  createEntitySchema(t).partial();

// Option B — only expose editable fields
export const updateEntitySchema = (t: ...) =>
  createEntitySchema(t).pick({ name: true, phone: true });

export type UpdateEntityFormData = z.infer<ReturnType<typeof updateEntitySchema>>;
```

Validation messages live in the `validation` namespace of the dictionary.

### useForm setup

```ts
const tValidation = useTranslations("validation");
const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
  control,
} = useForm<CreateEntityFormData>({
  resolver: zodResolver(createEntitySchema(tValidation)),
  defaultValues: { name: "", phone: "", password: "" },
});
```

### Reset on modal open

```ts
// Add modal — reset to empty defaults
useEffect(() => {
  if (isOpen) reset();
}, [isOpen, reset]);

// Edit modal — reset to existing entity data via mapper
useEffect(() => {
  if (isOpen && entity) reset(mapEntityToFormData(entity));
}, [isOpen, entity, reset]);
```

Always define a `mapEntityToFormData(entity)` mapper to explicitly convert the API shape to the form shape. Never spread the raw API entity directly into `reset()`.

### Async chained mutations (e.g. upload then create)

```ts
const handleFormSubmit = async (data: FormData) => {
  let imageUrl: string | undefined;
  if (selectedImage) {
    try {
      imageUrl = await new Promise((resolve, reject) => {
        uploadImageMutate(selectedImage, {
          onSuccess: resolve,
          onError: reject,
        });
      });
    } catch {
      return; // toast already shown by useApiMutation
    }
  }
  createEntityMutate(
    { ...data, imageUrl },
    {
      onSuccess: () => onClose(),
    },
  );
};
```

### FormField component

```tsx
// Password with toggle
<FormField type="password" showPasswordToggle />
// Phone — auto-forced LTR regardless of page direction
<FormField type="tel" />
```

---

## Modals

### Hierarchy

```
Modal (backdrop, escape key, scroll-lock, z-index)
└── FormModal (ModalHeader + scrollable form body + sticky ModalFooter)
└── DetailViewModal (ModalHeader + scrollable grid body)
```

### FormModal usage

```tsx
<FormModal
  isOpen={isOpen}
  onClose={onClose}
  title={t("addTitle")}
  onSubmit={handleSubmit(handleFormSubmit)}
  isLoading={createEntityPending}
>
  {/* form fields */}
</FormModal>
```

### Modal behavior

- Backdrop click → close
- Escape key → close
- `document.body.overflow = "hidden"` when open
- `isLoading` disables the close and cancel buttons

### Domain modal convention

Each domain has three modal files: `Add[Domain]Modal.tsx`, `Edit[Domain]Modal.tsx`, `View[Domain]Modal.tsx`.

### Edit modal pre-population

Edit modals receive the entity as a prop and pre-populate the form via mapper:

```tsx
interface EditEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity;
}

useEffect(() => {
  if (isOpen && entity) reset(mapEntityToFormData(entity));
}, [isOpen, entity, reset]);
```

Define `mapEntityToFormData` in the same file, or in a co-located `[domain].mapper.ts` if it is reused.

### Modal state ownership

Modal open/close state lives in the **page** component, not inside the table or list component. The table emits callbacks; the page decides what to render:

```tsx
// page.tsx
const [editTarget, setEditTarget] = useState<Entity | null>(null);

<EntityTable
  data={entities}
  onEdit={(entity) => setEditTarget(entity)}
/>
<EditEntityModal
  isOpen={!!editTarget}
  entity={editTarget!}
  onClose={() => setEditTarget(null)}
/>
```

---

## Tables

Uses **TanStack React Table v8**.

### Core Rule: All Filtering and Pagination Happen on the API

**Never** filter or paginate data client-side. Do not use `getFilteredRowModel()` or `getPaginationRowModel()`. All filter values and page state are sent as query parameters to the API — TanStack Table is used only for column definition, sorting display, and rendering. The server owns the data slice the user sees.

### Column Definition (shared pattern)

```ts
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

// ❌ Never import these — filtering and pagination are server-side:
// getFilteredRowModel, getPaginationRowModel

const columnHelper = createColumnHelper<Entity>();

const columns = useMemo(() => [
  columnHelper.accessor("field", {
    header: t("field"),
    cell: (info) => <span>{info.getValue()}</span>,
    size: 150,
  }),
  columnHelper.display({
    id: "actions",
    header: t("actions"),
    cell: (info) => (
      <div>
        <button onClick={() => handleView(info.row.original)}>
          <EyeIcon />
        </button>
      </div>
    ),
  }),
], [t]);

const table = useReactTable({
  data: entities,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(), // UI-only sort indicator, actual sorting sent to API
  // ❌ No getPaginationRowModel — pagination is server-side
  // ❌ No getFilteredRowModel — filtering is server-side
});
```

### Filters & Pagination State (page component)

All filter state and pagination state live in the **page** component. They are passed together to the domain hook which forwards them as API query parameters:

```tsx
// page.tsx
const [filters, setFilters] = useState<EntityFilters>({
  page: 1,
  limit: APP_CONFIG.defaultPageSize,
  search: "",
  // ...other filter fields (status, date range, etc.)
});

const { entities, total, isLoading, error, refetch } = useEntities(filters);
```

### Filter Types

Every domain that supports filtering must define an `EntityFilters` interface in its types file. Always include pagination fields:

```ts
// src/types/http/[domain].types.ts
export interface EntityFilters {
  page: number;
  limit: number;
  search?: string;
  status?: EntityStatus;
  // ...any other backend-supported filter fields
}
```

Only include fields the backend actually supports — never invent filter fields that are silently ignored.

### Updating Filters

Each filter change is a partial update to the filters state. **Changing any filter other than `page` must reset `page` back to `1`** — otherwise the user may land on a page that doesn't exist for the new filtered result set:

```tsx
// Search input change — resets to page 1
const handleSearchChange = useDebouncedCallback((value: string) => {
  setFilters((prev) => ({ ...prev, search: value, page: 1 }));
}, 400);

// Status dropdown change — resets to page 1
const handleStatusChange = (status: EntityStatus | "") => {
  setFilters((prev) => ({ ...prev, status: status || undefined, page: 1 }));
};

// Pagination control — only changes page, preserves all other filters
const handlePageChange = (newPage: number) => {
  setFilters((prev) => ({ ...prev, page: newPage }));
};
```

### Debouncing Text Search

Text search inputs **must** be debounced before updating filter state. Firing an API call on every keystroke is not acceptable:

```tsx
import { useDebouncedCallback } from "use-debounce";

const handleSearchChange = useDebouncedCallback((value: string) => {
  setFilters((prev) => ({ ...prev, search: value, page: 1 }));
}, 400); // 400ms is the standard debounce delay

<input
  type="text"
  onChange={(e) => handleSearchChange(e.target.value)}
  placeholder={t("searchPlaceholder")}
/>;
```

### Pagination Controls

Render pagination controls using the `total` count returned by the API and the current `filters.page`:

```tsx
const totalPages = Math.ceil(total / filters.limit);

<button
  onClick={() => handlePageChange(filters.page - 1)}
  disabled={filters.page <= 1}
>
  <ChevronLeftIcon className="rtl:scale-x-[-1]" />
</button>

<span>{filters.page} / {totalPages}</span>

<button
  onClick={() => handlePageChange(filters.page + 1)}
  disabled={filters.page >= totalPages}
>
  <ChevronRightIcon className="rtl:scale-x-[-1]" />
</button>
```

### Domain Hook — Passing Filters to the API

The domain hook receives the full filters object and passes it as query parameters. The query key must include the filters so React Query refetches when any filter changes:

```ts
export function useEntities(filters: EntityFilters) {
  const { data, isLoading, error, refetch } = useApiQuery(
    ["[domain]", filters], // filters in key → refetch on any filter change
    () => entityService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );
  return {
    entities: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}
```

### Service Layer — Serializing Filters

The service passes filters as `params` to axios, which serializes them as query string parameters automatically:

```ts
async getAll(filters: EntityFilters): Promise<{ items: Entity[]; total: number }> {
  const res = await httpClient.get<ApiResponse<{ items: Entity[]; total: number }>>(
    API_ENDPOINTS.[domain].list,
    { params: filters }
  );
  return res.data.data;
}
```

---

## Toasts

Never import from `react-toastify` directly. Always use the wrapper:

```ts
import { toast } from "@/lib/toast";
toast.success("Done");
toast.error("Something went wrong");
toast.info("Note");
const id = toast.loading("Saving...");
toast.dismiss(id);
```

`handleApiError(error)` from `@/lib/api/error-handler` calls `toast.error` automatically — do not duplicate.

---

## UI Primitives

### Button

```tsx
<Button variant="primary" loading={isPending}>Save</Button>
<Button variant="secondary" onClick={onClose}>Cancel</Button>
<Button variant="danger">Delete</Button>
```

- Primary: accent fill, white text
- Secondary: white fill, accent border
- `loading` shows spinner and disables button
- Scale animation: `hover:scale-[102%] active:scale-95`

### StatusBadge

```tsx
<StatusBadge status={entity.status} />
```

### StatusCard (summary/stats display)

```tsx
<StatusCard title={t("total")} value={count} icon={UsersIcon} />
```

### Spinner

```tsx
<Spinner /> // used for mutation pending overlay
```

### TableSkeleton

```tsx
<TableSkeleton rows={10} columns={5} />
```

### ErrorMessage

```tsx
<ErrorMessage onRetry={refetch} />
```

---

## Backend Spec / DTO Handling Rule

When receiving a backend response shape (DTO, API doc, or sample JSON) as a spec to implement a feature:

1. **Add every field to the TypeScript type** — never leave backend fields untyped. Optional fields use `field: Type | null`.
2. **Display every field in the view modal** — use `DetailViewSlot` (or the fields array pattern in `DetailViewModal`). Conditional fields (nullable) are shown only when non-null.
3. **Include every writable field in the add and edit modals** — add the field to the Zod schema, the DTO interface, the `mapEntityToFormData` mapper, and render it as a `FormField` in the form. Do not submit a subset of fields; pass the full form data object to the mutate call.
4. **Bilingual fields (arX / enX pairs) in forms** — always render both `arX` and `enX` fields side-by-side in a `grid grid-cols-2` row so the user can fill both languages at once.
5. **Bilingual fields in view modals** — show both AR and EN only for the entity's primary name fields. All other bilingual fields show a single row using the active locale value (`locale === "ar" ? arX : enX`), hidden when both are null.
6. **Add translation keys for every new field** in both `en.json` and `ar.json` under the appropriate domain namespace. For bilingual form fields use `arX`/`enX`-prefixed keys (e.g. `"arIndications": "Indications (AR)"`); for locale-aware view fields use a single neutral key (e.g. `"indications": "Indications"`).
7. Do not silently discard fields — if a field is received from the backend and not shown anywhere, that is a bug.

---

## Custom Hooks

### `useRouterWithLoader`

Wraps `next/navigation`'s `useRouter` to start NProgress on every navigation. **Always use this instead of `useRouter` directly.**

```ts
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";
const router = useRouterWithLoader();
router.push(`/${locale}/[route]`);
```

---

## TypeScript Conventions

### File suffixes

| File type        | Suffix                                                          |
| ---------------- | --------------------------------------------------------------- |
| Types/interfaces | `.types.ts`                                                     |
| Zod schemas      | `.schema.ts`                                                    |
| Services         | `-service.ts`                                                   |
| Domain hooks     | `use[Domain].ts` — Domain is PascalCase (e.g. `useStudents.ts`) |
| Constants        | `-constants.ts` or descriptive name (e.g. `api-endpoints.ts`)   |

### Naming

| Pattern          | Example                                     |
| ---------------- | ------------------------------------------- |
| Entity interface | `Student`, `Product`                        |
| Create payload   | `CreateStudentDto`                          |
| Update payload   | `UpdateStudentDto`                          |
| Filters          | `StudentFilters`                            |
| API response     | `ApiResponse<T>`                            |
| Enum values      | `StudentStatus.ACTIVE` (ALL_CAPS members)   |
| Component props  | `AddStudentModalProps`                      |
| Boolean props    | `isLoading`, `hasError`, `canDelete`        |
| Event handlers   | `handleSubmit`, `handleClose`, `handleView` |

### Strict type rules

- Never use `any`. Prefer `unknown` with type guards.
- Always type API response generics explicitly: `ApiResponse<Entity[]>` — never `ApiResponse<any>`.
- Always type `useState` when the initial value is `null` or ambiguous: `useState<Entity | null>(null)`.

### Enums for status fields

```ts
export enum EntityStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}
```

ALL_CAPS string literals must match the backend values exactly.

---

## Tailwind Conventions

### Custom color tokens (use instead of raw hex)

- **Primary accent**: `wheat`, `wheat-dark`, `wheat-light`
- **Background**: `lightBg` (#f8f7fa), `lightMain` (#ffffff)
- **Font**: `lightFont`
- **Status**: `success`, `warning`, `error`, `info`, `gold`

### Breakpoints (non-standard)

```
sm: 500px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
```

### Common patterns

```tsx
// Cards
className = "bg-white rounded-xl p-4 border-b-2 border-wheat";
// Input focus
className = "border-wheat hover:border-wheat-dark focus:shadow-md";
// Error state
className = "border-red-500 hover:border-red-600";
// Label + focus-within
className =
  "text-[13px] text-wheat group-focus-within/input:text-wheat-dark transition-all";
// Page layout
className = "flex h-screen bg-lightBg";
// Grid form layout
className = "grid grid-cols-2 gap-4";
```

### Dark mode

Tailwind dark mode is class-based (`darkMode: ["class"]`). Dark color tokens: `darkBg`, `darkMain`, `darkHover`, `darkFont`.

---

## Providers (order matters)

```tsx
<QueryProvider>
  {" "}
  {/* React Query */}
  <NextIntlProvider>
    {" "}
    {/* i18n */}
    <NProgressBar /> {/* NProgress bar (component, not a provider) */}
    <ToastProvider /> {/* react-toastify */}
    {children}
  </NextIntlProvider>
</QueryProvider>
```

`PageTitleProvider` wraps only the protected layout, not the root.

---

## File & Component Naming

| Type             | Convention                                 | Example             |
| ---------------- | ------------------------------------------ | ------------------- |
| Page components  | lowercase folder + `page.tsx`              | `[domain]/page.tsx` |
| React components | PascalCase                                 | `EntityTable.tsx`   |
| Hooks            | camelCase, `use` prefix, PascalCase domain | `useStudents.ts`    |
| Services         | kebab-case                                 | `entity-service.ts` |
| Types            | kebab-case                                 | `entity.types.ts`   |
| Schemas          | kebab-case                                 | `entity.schema.ts`  |
| Constants        | kebab-case                                 | `api-endpoints.ts`  |

---

## Filter URL Params Pattern

All pages that display filterable/paginated data **must** derive their filter state from URL search params, not `useState`. The URL is the single source of truth for applied filters.

### Pattern

```tsx
"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";

export default function SomePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouterWithLoader();

  // Derive filters from URL
  const filters = useMemo<SomeFilters>(() => ({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || undefined,
    // ...other fields
  }), [searchParams]);

  // Serialize filters back to URL on change
  const handleFiltersChange = useCallback((newFilters: SomeFilters) => {
    const params = new URLSearchParams();
    params.set("page", String(newFilters.page || 1));
    params.set("limit", String(newFilters.limit || 10));
    if (newFilters.search) params.set("search", newFilters.search);
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname]);
}
```

### Rules

- Pages use `useSearchParams()` + `usePathname()` + `useRouterWithLoader` — no `useState` for applied filters.
- `handleFiltersChange` serializes the new filter object into URLSearchParams and calls `router.replace`.
- Tables keep their **local pre-apply state** unchanged (`useState` inside the table for the form inputs before "Apply" is clicked). Only the "Apply" / "Clear" click calls `onFiltersChange`, which triggers the URL update.
- Pagination buttons call `onFiltersChange` directly (no local state needed).

### Cross-Page Navigation (Pre-filtered)

To navigate from one domain page to another with a pre-applied filter, push to the target URL with the relevant filter as a query param:

```ts
// From students page → student-procedures filtered by that student
router.push(`/${locale}/dashboard/student-procedures?studentId=${student.id}`);

// From procedures page → student-procedures filtered by that procedure
router.push(`/${locale}/dashboard/student-procedures?procedureId=${procedure.id}`);

// From supervisors page → student-procedures filtered by that supervisor
router.push(`/${locale}/dashboard/student-procedures?supervisorId=${supervisor.id}`);
```

The target page reads these params from `useSearchParams()` and passes them directly to the API as filter params. No special handling needed — the URL IS the filter state.

### Checklist addition

- [ ] All filterable pages use `useSearchParams()` to derive filters — never `useState<XFilters>`.
- [ ] `handleFiltersChange` updates the URL via `router.replace`, not `setFilters`.
- [ ] Cross-page navigation to pre-filter uses query params matching the target API's supported filter fields.

---

## Best Practices Checklist

- [ ] Use `@/` imports everywhere — never relative `../`.
- [ ] Every page in `[locale]/` must export `generateStaticParams` and `dynamic = "force-static"` if it is a layout/root route.
- [ ] Always call `setRequestLocale(locale)` in server components before any rendering.
- [ ] Use `useRouterWithLoader` instead of `useRouter` for all navigation.
- [ ] Never call `react-toastify` directly — use `@/lib/toast`.
- [ ] Never store the token in `localStorage` or `sessionStorage` — cookies only.
- [ ] Never hardcode API path strings — use `API_ENDPOINTS` from `@/constants/api-endpoints`.
- [ ] Never hardcode config values (cookie name, page size, etc.) — use `APP_CONFIG` from `@/constants/app-config`.
- [ ] Every new environment variable must be added to the reference table in the Environment Variables section.
- [ ] Zod schemas must be factory functions accepting `t` for localized errors.
- [ ] Edit schemas must derive from create schemas via `.partial()` or `.pick()` — never duplicate field definitions.
- [ ] Domain hooks must invalidate the correct query key on mutation success.
- [ ] Never use `getFilteredRowModel()` or `getPaginationRowModel()` — all filtering and pagination are server-side.
- [ ] All filter state lives in the page component and is passed to the domain hook as query parameters.
- [ ] Changing any filter (search, status, etc.) must reset `page` back to `1`.
- [ ] Text search inputs must be debounced (400ms) before updating filter state.
- [ ] The React Query key for list queries must include the full filters object so any filter change triggers a refetch.
- [ ] The `EntityFilters` interface must only include fields the backend actually supports.
- [ ] `"use client"` must be the first line of any client component or service that accesses browser APIs.
- [ ] Prefer server components by default — push `"use client"` as deep in the tree as possible.
- [ ] Never add `"use client"` to layout files unless strictly unavoidable.
- [ ] Server components must never import client-only hooks.
- [ ] Never use `any` — prefer `unknown` with type guards.
- [ ] Always type API response generics explicitly: `ApiResponse<Entity[]>` not `ApiResponse<any>`.
- [ ] Phone inputs must be `type="tel"` (triggers auto-LTR in `FormField`).
- [ ] Password inputs must use `showPasswordToggle` prop.
- [ ] Add modals must reset the form with `reset()` on open.
- [ ] Edit modals must reset the form with `reset(mapEntityToFormData(entity))` on open — never spread raw API entity into `reset()`.
- [ ] Modal open/close state must live in the page, not inside table or list components.
- [ ] Add both `en.json` and `ar.json` entries for every new translation key.
- [ ] Status enums use ALL_CAPS string literals matching the backend exactly.
- [ ] `401` responses are handled globally in the interceptor — never handle them again in hooks or components.
- [ ] Co-locate `mapEntityToFormData` with the edit modal, or extract to `[domain].mapper.ts` if shared.
