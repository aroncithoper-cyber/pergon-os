# Auth & Authorization Architecture

Package: `@pergon/auth`

## Propósito

Sistema enterprise de autenticación y autorización multi-tenant. Fail closed. Autorización por **permisos**, no por roles.

## Principios

1. Rol = bundle de permisos; las policies/guards validan `permission`.
2. Todo contexto de acceso incluye `organization_id`.
3. Sesiones con refresh rotation + auditoría append-only.
4. MFA preparado (`mfa_challenges` + verify stub TOTP).
5. Guest = ausencia de sesión + permisos públicos (`verify:public`, etc.).

## Roles de sistema

`super_admin`, `admin`, `production`, `sales`, `distributor`, `customer`, `guest`, `service`

## Flujo

```text
API → Validation (Zod) → Use Case → Policies/Guards → Ports (UoW) → Memory|Supabase
Bearer token → authenticateRequest → AuthContext(permissions) → requirePermission
```

## Capas

| Capa           | Contenido                                       |
| -------------- | ----------------------------------------------- |
| Domain         | catalog, models, crypto, policies, errors       |
| Application    | use cases, services, guards, middleware helpers |
| Validation     | Zod schemas                                     |
| Infrastructure | memory UoW (default), supabase factory stub     |

## Use cases

- bootstrapSystemCatalog / createOrganizationWithOwner
- login / logout / refreshSession / getSessionFromAccessToken / listSessions
- verifyMfaChallenge (prepared)
- inviteUser / acceptInvitation
- requestPasswordReset / resetPassword
- assignRoles

## APIs (sin UI)

Admin:

- `POST /api/v1/auth/login|logout|refresh`
- `GET /api/v1/auth/session`
- `GET /api/v1/auth/sessions`
- `POST /api/v1/auth/mfa/verify`
- `POST /api/v1/auth/password/forgot|reset`
- `POST /api/v1/organizations`
- `POST /api/v1/users/invite`
- `POST /api/v1/users/roles`
- `POST /api/v1/invitations/accept`

Web (público/portal):

- login, logout, refresh, session, password forgot/reset, accept invitation

## Persistencia

Migración: `supabase/migrations/20260304220000_auth_core.sql`
