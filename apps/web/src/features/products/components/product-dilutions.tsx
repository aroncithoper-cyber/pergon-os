"use client";

import { useMemo, useState } from "react";
import type { CatalogDilutionRecord } from "@pergon/catalog";

import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";
import { Section } from "@pergon/ui/components/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pergon/ui/components/select";

type ProductDilutionsProps = {
  dilutions: CatalogDilutionRecord[];
  calculator: Record<string, unknown>;
};

function parseRatio(ratio: string | undefined): number | null {
  if (!ratio) return null;
  const parts = ratio.split(":").map((p) => Number(p.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  const [a, b] = parts as [number, number];
  return a / (a + b);
}

export function ProductDilutions({ dilutions, calculator }: ProductDilutionsProps) {
  const enabled = calculator.enabled !== false;
  const [selectedId, setSelectedId] = useState(dilutions[0]?.id ?? "");
  const [totalVolume, setTotalVolume] = useState("1000");

  const selected = useMemo(
    () => dilutions.find((d) => d.id === selectedId) ?? dilutions[0],
    [dilutions, selectedId],
  );

  const concentrateRatio = parseRatio(selected?.ratio);
  const total = Number(totalVolume);
  const concentrateMl =
    concentrateRatio !== null && Number.isFinite(total) && total > 0
      ? Math.round(total * concentrateRatio * 100) / 100
      : null;
  const waterMl = concentrateMl !== null ? Math.round((total - concentrateMl) * 100) / 100 : null;

  return (
    <Container size="lg" asChild>
      <Section
        title="Diluciones"
        description="Recetas y calculadora alimentadas por datos de catálogo."
      >
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">Recetas</h3>
            {dilutions.length === 0 ? (
              <EmptyState
                title="Sin diluciones publicadas"
                description="Las ratios se gestionan en catalog_dilutions."
                className="items-start px-0 py-6 text-left"
              />
            ) : (
              <ul className="divide-border border-border divide-y border-y">
                {dilutions.map((item) => (
                  <li key={item.id} className="space-y-2 py-5">
                    <p className="text-foreground text-sm font-medium">{item.label}</p>
                    {item.ratio ? (
                      <p className="text-muted-foreground font-mono text-xs">{item.ratio}</p>
                    ) : null}
                    {item.useCase ? (
                      <p className="text-muted-foreground text-sm">{item.useCase}</p>
                    ) : null}
                    {item.instructions ? (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.instructions}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">
              Calculadora de dilución
            </h3>
            {!enabled || dilutions.length === 0 || concentrateRatio === null ? (
              <EmptyState
                title="Calculadora en espera de datos"
                description="Requiere diluciones con ratio válida (ej. 1:10) publicadas por Admin."
                className="items-start px-0 py-6 text-left"
              />
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="dilution-recipe">Receta</Label>
                  <Select value={selected?.id} onValueChange={setSelectedId}>
                    <SelectTrigger id="dilution-recipe">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {dilutions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                          {item.ratio ? ` (${item.ratio})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dilution-volume">Volumen total (ml)</Label>
                  <Input
                    id="dilution-volume"
                    inputMode="decimal"
                    value={totalVolume}
                    onChange={(event) => setTotalVolume(event.target.value)}
                  />
                </div>
                <div className="border-border space-y-2 border-y py-4">
                  <p className="text-sm">
                    Concentrado:{" "}
                    <span className="font-medium tabular-nums">{concentrateMl ?? "—"} ml</span>
                  </p>
                  <p className="text-sm">
                    Agua: <span className="font-medium tabular-nums">{waterMl ?? "—"} ml</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTotalVolume("1000")}
                  className="w-full sm:w-auto"
                >
                  Restablecer a 1000 ml
                </Button>
              </div>
            )}
          </div>
        </div>
      </Section>
    </Container>
  );
}
