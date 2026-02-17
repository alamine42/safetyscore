import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          borderRadius: 6,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 2L3 8v12l11 6 11-6V8L14 2z"
            fill="white"
            opacity="0.3"
          />
          <path
            d="M9 14l3 3 7-7"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
