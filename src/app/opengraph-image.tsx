import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SafetyScore - AI Safety Ratings for Everyone";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(34, 197, 94, 0.3)",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 28 28" fill="none">
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

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 16,
            display: "flex",
          }}
        >
          SafetyScore
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#64748b",
            marginBottom: 48,
            display: "flex",
          }}
        >
          AI Safety Ratings for Everyone
        </div>

        {/* Score preview */}
        <div
          style={{
            display: "flex",
            gap: 24,
          }}
        >
          {[
            { label: "Honesty", score: 91, color: "#22c55e" },
            { label: "Fairness", score: 85, color: "#22c55e" },
            { label: "Safety", score: 94, color: "#22c55e" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 32px",
                background: "white",
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: item.color,
                  display: "flex",
                }}
              >
                {item.score}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#64748b",
                  display: "flex",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
