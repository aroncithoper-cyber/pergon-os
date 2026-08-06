import type { PublicVerificationPassport } from "@pergon/identity";

import { SignatureDataBlock } from "@pergon/ui/components/signature";

import { displayValue, formatDate } from "../lib/presentation";

type VerifyInfoPanelProps = {
  passport: PublicVerificationPassport;
};

export function VerifyInfoPanel({ passport }: VerifyInfoPanelProps) {
  const productLabel = passport.product.name ?? passport.product.sku ?? null;

  const rows = [
    { label: "Producto", value: displayValue(productLabel) },
    { label: "Estado", value: displayValue(passport.state) },
    { label: "Lote", value: displayValue(passport.batch.code) },
    {
      label: "Fabricación",
      value: displayValue(formatDate(passport.batch.manufacturedAt)),
    },
    {
      label: "Última recarga",
      value: displayValue(formatDate(passport.recharges.lastAt)),
    },
    { label: "Recargas", value: displayValue(passport.recharges.count) },
    {
      label: "Edad del envase",
      value:
        passport.container.ageDays === null
          ? "Sin dato"
          : `${passport.container.ageDays} día${passport.container.ageDays === 1 ? "" : "s"}`,
    },
    { label: "Estado del envase", value: displayValue(passport.container.state) },
  ];

  return (
    <section aria-labelledby="verify-info-heading" className="space-y-6">
      <h2 id="verify-info-heading" className="type-h3 text-foreground">
        Datos del pasaporte
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {rows.map((row) => (
          <SignatureDataBlock key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      <p className="type-caption text-muted-foreground leading-relaxed">
        Campos sin dato se completan cuando catálogo y lotes están conectados. No se inventan
        valores.
      </p>
    </section>
  );
}
