import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.primary,
          color: BRAND.accent,
          fontSize: 72,
          fontWeight: 700,
        }}
      >
        AP
      </div>
    ),
    { ...size },
  );
}
