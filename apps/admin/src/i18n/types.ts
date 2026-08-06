import type { UiLocale } from "@pergon/shared/i18n";

/**
 * Nested message dictionary. Leaf values are strings.
 * Interpolation: use `{name}` placeholders.
 */
export type MessageTree = {
  [key: string]: string | MessageTree;
};

export type AdminDictionaries = Record<UiLocale, MessageTree>;

export function resolveMessage(
  tree: MessageTree,
  key: string,
  params?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let node: string | MessageTree | undefined = tree;
  for (const part of parts) {
    if (node == null || typeof node === "string") {
      return key;
    }
    node = node[part];
  }
  if (typeof node !== "string") return key;
  if (!params) return node;
  return node.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}
