/** Canonical system event types any module may emit into the automation bus. */
export const AUTOMATION_EVENT_TYPES = [
  "customer.created",
  "order.created",
  "qr.created",
  "qr.scanned",
  "product.blocked",
  "passport.recharged",
  "status.changed",
  "inventory.low",
  "sale.created",
  "distributor.created",
  "ai.conversation.created",
  "user.created",
  "system.error",
  "schedule.tick",
  "webhook.received",
] as const;

export type AutomationEventType = (typeof AUTOMATION_EVENT_TYPES)[number];

/** Canonical action kinds executed by the engine (handlers are injectable). */
export const AUTOMATION_ACTION_KINDS = [
  "send_email",
  "send_whatsapp",
  "notify_internal",
  "create_task",
  "update_record",
  "change_status",
  "create_report",
  "call_api",
  "run_ai",
  "generate_pdf",
  "generate_qr",
  "create_alert",
] as const;

export type AutomationActionKind = (typeof AUTOMATION_ACTION_KINDS)[number];
