"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-accent text-xs">
      Print receipt
    </button>
  );
}

export function BackButton() {
  return (
    <button onClick={() => history.back()} className="text-xs text-muted hover:underline">
      ← Back
    </button>
  );
}
