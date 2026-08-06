import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0D12",
        borderRadius: 6,
        color: "#F4F6F8",
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: "-0.04em",
      }}
    >
      P
    </div>,
    { ...size },
  );
}
