import type { OrganizationId } from "../../domain/base";
import { newId, nowIso } from "../../domain/base";
import type {
  NotificationChannel,
  NotificationOutboxRecord,
  NotificationRecord,
} from "../../domain/models";

export type EnqueueNotificationInput = {
  organizationId: OrganizationId;
  channel: NotificationChannel;
  title: string;
  body: string;
  recipientUserId?: string;
  recipientAddress?: string;
  deepLink?: string;
  metadata?: Record<string, unknown>;
};

export interface NotificationSink {
  saveNotification(n: NotificationRecord): Promise<void>;
  saveOutbox(o: NotificationOutboxRecord): Promise<void>;
  listPendingOutbox(limit: number): Promise<NotificationOutboxRecord[]>;
  updateOutbox(o: NotificationOutboxRecord): Promise<void>;
  updateNotification(n: NotificationRecord): Promise<void>;
  findNotification(id: string): Promise<NotificationRecord | null>;
}

export type ChannelDispatcher = (
  notification: NotificationRecord,
  outbox: NotificationOutboxRecord,
) => Promise<{ ok: boolean; error?: string }>;

const DEFAULT_DISPATCHERS: Record<NotificationChannel, ChannelDispatcher> = {
  async email() {
    return { ok: true };
  },
  async whatsapp() {
    return { ok: true };
  },
  async push() {
    return { ok: true };
  },
  async in_app() {
    return { ok: true };
  },
};

/** Notification engine — email / WhatsApp / push / in-app via outbox. */
export function createNotificationEngine(
  sink: NotificationSink,
  dispatchers: Partial<Record<NotificationChannel, ChannelDispatcher>> = {},
) {
  const channels = { ...DEFAULT_DISPATCHERS, ...dispatchers };

  return {
    async enqueue(input: EnqueueNotificationInput): Promise<NotificationRecord> {
      const now = nowIso();
      const notification: NotificationRecord = {
        id: newId(),
        organizationId: input.organizationId,
        channel: input.channel,
        status: input.channel === "in_app" ? "sent" : "queued",
        recipientUserId: input.recipientUserId,
        recipientAddress: input.recipientAddress,
        title: input.title,
        body: input.body,
        deepLink: input.deepLink,
        metadata: input.metadata ?? {},
        createdAt: now,
        sentAt: input.channel === "in_app" ? now : undefined,
      };
      await sink.saveNotification(notification);

      if (input.channel !== "in_app") {
        await sink.saveOutbox({
          id: newId(),
          organizationId: input.organizationId,
          notificationId: notification.id,
          channel: input.channel,
          payload: {
            title: input.title,
            body: input.body,
            recipientAddress: input.recipientAddress,
            recipientUserId: input.recipientUserId,
            deepLink: input.deepLink,
          },
          attempts: 0,
          nextAttemptAt: now,
          createdAt: now,
        });
      }

      return notification;
    },

    async markRead(notificationId: string, userId: string): Promise<NotificationRecord | null> {
      const n = await sink.findNotification(notificationId);
      if (!n || n.recipientUserId !== userId) return null;
      n.status = "read";
      n.readAt = nowIso();
      await sink.updateNotification(n);
      return n;
    },

    async drainOutbox(limit = 50): Promise<{ processed: number; failed: number }> {
      const pending = await sink.listPendingOutbox(limit);
      let processed = 0;
      let failed = 0;
      for (const item of pending) {
        const notification = await sink.findNotification(item.notificationId);
        if (!notification) continue;
        const dispatcher = channels[item.channel];
        const result = await dispatcher(notification, item);
        item.attempts += 1;
        if (result.ok) {
          notification.status = "sent";
          notification.sentAt = nowIso();
          await sink.updateNotification(notification);
          item.nextAttemptAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
          processed += 1;
        } else {
          notification.status = "failed";
          notification.error = result.error;
          await sink.updateNotification(notification);
          item.nextAttemptAt = new Date(
            Date.now() + Math.min(3600_000, 2 ** item.attempts * 1000),
          ).toISOString();
          failed += 1;
        }
        await sink.updateOutbox(item);
      }
      return { processed, failed };
    },
  };
}

export type NotificationEngine = ReturnType<typeof createNotificationEngine>;
