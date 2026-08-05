export type NavItem = {
  href: string;
  label: string;
  permission?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** Navigation map — routes consume existing /api/v1 modules only. */
export const ADMIN_NAV: NavGroup[] = [
  {
    title: "Operación",
    items: [
      { href: "/dashboard", label: "Dashboard", permission: "dashboard:read" },
      { href: "/alerts", label: "Alertas", permission: "alerts:read" },
      { href: "/notifications", label: "Notificaciones", permission: "notifications:read" },
    ],
  },
  {
    title: "Identidad",
    items: [
      { href: "/passports", label: "Pasaportes", permission: "passports:read" },
      { href: "/qr", label: "QR", permission: "qr:read" },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/products", label: "Productos", permission: "products:read" },
      { href: "/customers", label: "Clientes", permission: "customers:read" },
      { href: "/distributors", label: "Distribuidores", permission: "distributors:read" },
    ],
  },
  {
    title: "Planta",
    items: [
      { href: "/production", label: "Producción", permission: "production:read" },
      { href: "/inventory", label: "Inventario", permission: "inventory:read" },
    ],
  },
  {
    title: "Personas",
    items: [
      { href: "/users", label: "Usuarios", permission: "users:read" },
      { href: "/roles", label: "Roles", permission: "roles:read" },
      { href: "/academy", label: "Academia" },
    ],
  },
  {
    title: "Inteligencia",
    items: [
      { href: "/ai", label: "IA", permission: "expert:use_admin" },
      { href: "/automations", label: "Automatizaciones", permission: "automations:read" },
      { href: "/reports", label: "Reportes", permission: "reports:read" },
      { href: "/audit", label: "Auditoría", permission: "audit:read" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/settings", label: "Configuración", permission: "settings:read" },
      { href: "/profile", label: "Perfil" },
    ],
  },
];

export const COMMAND_ITEMS = ADMIN_NAV.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    group: group.title,
  })),
);
