import { ImageResponse } from "next/og";
import { BRAND, SITE_NAME } from "@/lib/constants";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.primary,
          color: BRAND.accent,
          fontSize: 148,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        AP
        <div
          style={{
            marginTop: 8,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "#ffffff",
          }}
        >
          {SITE_NAME.split(" ")[0]?.toUpperCase()}
        </div>
      </div>
    ),
    { ...size },
  );
}
