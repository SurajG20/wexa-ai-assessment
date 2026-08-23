"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#12141a", color: "#e8eaee", padding: "4rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>SiliconTrace could not start</h1>
        <p style={{ color: "#9aa1ad", marginTop: "0.75rem", fontSize: "0.9rem" }}>{error.message}</p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            background: "#e8a33d",
            color: "#1a1206",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </body>
    </html>
  );
}
