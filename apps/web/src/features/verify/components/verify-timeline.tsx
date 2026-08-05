import type { PublicTimelineItem } from "@pergon/identity";
import { EmptyState } from "@pergon/ui/components/empty-state";

import { formatDateTime } from "../lib/presentation";

type VerifyTimelineProps = {
  items: PublicTimelineItem[];
};

export function VerifyTimeline({ items }: VerifyTimelineProps) {
  if (items.length === 0) {
    return (
      <section aria-labelledby="verify-timeline-heading" className="space-y-4">
        <h2
          id="verify-timeline-heading"
          className="text-foreground text-xl font-semibold tracking-tight"
        >
          Timeline
        </h2>
        <EmptyState
          title="Sin eventos públicos"
          description="Cuando existan eventos del pasaporte, aparecerán aquí en orden cronológico."
        />
      </section>
    );
  }

  return (
    <section aria-labelledby="verify-timeline-heading" className="space-y-6">
      <h2
        id="verify-timeline-heading"
        className="text-foreground text-xl font-semibold tracking-tight"
      >
        Timeline
      </h2>
      <ol className="border-border relative space-y-0 border-l pl-6">
        {items.map((item) => (
          <li key={item.id} className="relative pb-8 last:pb-0">
            <span
              aria-hidden="true"
              className="bg-foreground absolute -left-[1.625rem] top-1.5 size-2.5 rounded-full"
            />
            <div className="space-y-1">
              <p className="text-foreground text-sm font-medium tracking-tight">{item.label}</p>
              <p className="text-muted-foreground text-xs">
                {formatDateTime(item.occurredAt) ?? item.occurredAt}
              </p>
              {item.detail ? (
                <p className="text-muted-foreground text-sm leading-relaxed">{item.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
