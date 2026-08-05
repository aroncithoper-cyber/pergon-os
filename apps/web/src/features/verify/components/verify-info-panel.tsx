import type { PublicVerificationPassport } from "@pergon/identity";
import { Separator } from "@pergon/ui/components/separator";

import { displayValue, formatDate } from "../lib/presentation";

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:items-baseline sm:gap-6">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-foreground text-sm font-medium tracking-tight">{value}</dd>
    </div>
  );
}

type VerifyInfoPanelProps = {
  passport: PublicVerificationPassport;
};

export function VerifyInfoPanel({ passport }: VerifyInfoPanelProps) {
  const productLabel = passport.product.name ?? passport.product.sku ?? null;

  return (
    <section aria-labelledby="verify-info-heading" className="space-y-4">
      <h2 id="verify-info-heading" className="text-foreground text-xl font-semibold tracking-tight">
        Información principal
      </h2>
      <dl className="border-border divide-border divide-y border-y">
        <InfoRow label="Producto" value={displayValue(productLabel)} />
        <InfoRow label="Estado" value={displayValue(passport.state)} />
        <InfoRow label="Lote" value={displayValue(passport.batch.code)} />
        <InfoRow
          label="Fecha de fabricación"
          value={displayValue(formatDate(passport.batch.manufacturedAt))}
        />
        <InfoRow
          label="Última recarga"
          value={displayValue(formatDate(passport.recharges.lastAt))}
        />
        <InfoRow label="Recargas realizadas" value={displayValue(passport.recharges.count)} />
        <InfoRow
          label="Edad del envase"
          value={
            passport.container.ageDays === null
              ? "Sin dato"
              : `${passport.container.ageDays} día${passport.container.ageDays === 1 ? "" : "s"}`
          }
        />
        <InfoRow label="Estado del envase" value={displayValue(passport.container.state)} />
      </dl>
      <Separator className="sr-only" />
      <p className="text-muted-foreground text-xs leading-relaxed">
        Los campos sin dato se completarán cuando el catálogo y lotes estén conectados al pasaporte.
        No se inventan valores.
      </p>
    </section>
  );
}
