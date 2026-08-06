import { ImageResponse } from "next/og";

export const alt = "PerGon OS — identidad digital y trazabilidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(145deg, #0B0D12 0%, #12161F 55%, #0B0D12 100%)",
        color: "#F4F6F8",
        fontFamily: "system-ui, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#0B0D12",
            border: "1px solid rgba(30,107,255,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          P
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em" }}>PerGon OS</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          Identidad digital para cada unidad.
        </div>
        <div style={{ fontSize: 28, color: "rgba(244,246,248,0.72)", lineHeight: 1.35 }}>
          Verificación QR, Pasaporte Digital y trazabilidad — con confianza server-side.
        </div>
      </div>
      <div style={{ fontSize: 18, color: "rgba(30,107,255,0.95)", letterSpacing: "0.16em" }}>
        TECNOLOGÍA · SEGURIDAD · TRAZABILIDAD
      </div>
    </div>,
    { ...size },
  );
}
