import React, { useEffect, useRef } from "react";

function getLogStyle(line) {
  if (line.includes("✅")) return { color: "green" };
  if (line.includes("❌") || line.includes("ERROR")) return { color: "red" };
  if (line.includes("⏳") || line.includes("🧹")) return { color: "#b8860b" };
  if (line.includes("🚀") || line.includes("🔧")) return { color: "#0074d9" };
  return {};
}

function LogViewer({ logs }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div ref={logRef} className="log-viewer" style={{ whiteSpace: "pre-line", background: "#f4f4f4", padding: "1rem", height: "300px", overflowY: "scroll", borderRadius: "8px" }}>
      {logs.map((line, index) => (
        <div key={index} style={getLogStyle(line)}>{line}</div>
      ))}
    </div>
  );
}

export default LogViewer;