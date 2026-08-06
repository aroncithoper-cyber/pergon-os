import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0D12",
        borderRadius: 36,
        color: "#F4F6F8",
        fontSize: 96,
        fontWeight: 600,
        letterSpacing: "-0.04em",
        border: "2px solid rgba(30,107,255,0.35)",
      }}
    >
      P
    </div>,
    { ...size },
  );
}
