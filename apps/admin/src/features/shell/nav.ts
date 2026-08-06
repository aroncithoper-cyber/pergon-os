import { tStatic } from "@/i18n";

export type NavItem = {
  href: string;
  label: string;
  permission?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** Navigation map — routes consume existing /api/v1 modules only. Labels via i18n (es-MX). */
export const ADMIN_NAV: NavGroup[] = [
  {
    title: tStatic("nav.operation"),
    items: [
      { href: "/dashboard", label: tStatic("nav.dashboard"), permission: "dashboard:read" },
      { href: "/alerts", label: tStatic("nav.alerts"), permission: "alerts:read" },
      {
        href: "/notifications",
        label: tStatic("nav.notifications"),
        permission: "notifications:read",
      },
    ],
  },
  {
    title: tStatic("nav.identity"),
    items: [
      { href: "/passports", label: tStatic("nav.passports"), permission: "passports:read" },
      { href: "/qr", label: tStatic("nav.qr"), permission: "qr:read" },
    ],
  },
  {
    title: tStatic("nav.catalog"),
    items: [
      { href: "/products", label: tStatic("nav.products"), permission: "products:read" },
      { href: "/customers", label: tStatic("nav.customers"), permission: "customers:read" },
      {
        href: "/distributors",
        label: tStatic("nav.distributors"),
        permission: "distributors:read",
      },
    ],
  },
  {
    title: tStatic("nav.plant"),
    items: [
      { href: "/production", label: tStatic("nav.production"), permission: "production:read" },
      { href: "/inventory", label: tStatic("nav.inventory"), permission: "inventory:read" },
    ],
  },
  {
    title: tStatic("nav.people"),
    items: [
      { href: "/users", label: tStatic("nav.users"), permission: "users:read" },
      { href: "/roles", label: tStatic("nav.roles"), permission: "roles:read" },
      { href: "/academy", label: tStatic("nav.academy") },
    ],
  },
  {
    title: tStatic("nav.intelligence"),
    items: [
      { href: "/ai", label: tStatic("nav.ai"), permission: "expert:use_admin" },
      {
        href: "/automations",
        label: tStatic("nav.automations"),
        permission: "automations:read",
      },
      { href: "/reports", label: tStatic("nav.reports"), permission: "reports:read" },
      { href: "/audit", label: tStatic("nav.audit"), permission: "audit:read" },
    ],
  },
  {
    title: tStatic("nav.cms"),
    items: [
      { href: "/cms/home", label: tStatic("nav.home"), permission: "cms:read" },
      { href: "/cms/media", label: tStatic("nav.media"), permission: "cms:read" },
    ],
  },
  {
    title: tStatic("nav.system"),
    items: [
      { href: "/settings", label: tStatic("nav.settings"), permission: "settings:read" },
      { href: "/profile", label: tStatic("nav.profile") },
      ...(process.env.NODE_ENV === "development"
        ? [
            { href: "/tools", label: tStatic("nav.tools") },
            { href: "/tools/auth-diagnosis", label: tStatic("nav.authDiagnosis") },
          ]
        : []),
    ],
  },
];

export const COMMAND_ITEMS = ADMIN_NAV.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    group: group.title,
  })),
);
