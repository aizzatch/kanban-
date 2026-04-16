import { useState } from "react";

type Props = {
  onNewGuest: () => void;
  onReturnGuest: (userId: string) => void;
  loading: boolean;
  error: string | null;
};

export default function AuthScreen({
  onNewGuest,
  onReturnGuest,
  loading,
  error,
}: Props) {
  const [inputId, setInputId] = useState("");

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h1>Kanban Board</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <p>Have a previous guest ID?</p>
        <input
          type="text"
          placeholder="Enter your Guest ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          style={{ padding: "0.4rem", width: "320px" }}
        />
        <br />
        <button
          onClick={() => onReturnGuest(inputId.trim())}
          disabled={loading || !inputId.trim()}
          style={{ marginTop: "0.5rem" }}
        >
          {loading ? "Loading..." : "Continue with ID"}
        </button>
      </div>

      <p>— or —</p>

      <button onClick={onNewGuest} disabled={loading}>
        {loading ? "Setting up..." : "New Guest Session"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
