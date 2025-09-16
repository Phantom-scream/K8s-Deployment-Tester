import React from "react";

function PodTracker({ data }) {
  const { namespace, selector, pods } = data;
  return (
    <div style={{ marginTop: 12, padding: 12, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fff7f0" }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Pod tracker</div>
      <div style={{ fontSize: 12, color: "#555" }}>ns: {namespace} • selector: {selector}</div>
      <ul style={{ marginTop: 8 }}>
        {pods.map(p => (
          <li key={p.name}>
            <code>{p.name}</code> — {p.phase} — restarts: {p.restarts} {p.node ? `— node: ${p.node}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PodTracker;