import React, { useState } from "react";
import axios from "axios";

function UploadForm({ socketId, onTestStart, isRunning }) {
  const [file, setFile] = useState(null);
  const [customCmd, setCustomCmd] = useState("");

  const handleUpload = async () => {
    if (!file || !socketId) return alert("Upload a file and wait for socket to connect!");

    const formData = new FormData();
    formData.append("yamlFile", file);
    formData.append("socketId", socketId);
    formData.append("customCmd", customCmd);

    try {
      const res = await axios.post("http://localhost:4000/upload", formData);
      const filePath = res.data.filePath || null;
      onTestStart(filePath);
    } catch (e) {
      alert(`Upload failed: ${e?.response?.data?.error || e.message}`);
    }
  };

  const disabled = isRunning || !socketId || !file;

  return (
    <div className="upload-form">
      <input
        type="file"
        accept=".yaml,.yml"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={isRunning}
      />
      <input
        type="text"
        placeholder="Optional: Custom test command (e.g. curl ...)"
        value={customCmd}
        onChange={e => setCustomCmd(e.target.value)}
        style={{ marginLeft: 8, width: 300 }}
        disabled={isRunning}
      />
      <button onClick={handleUpload} disabled={disabled}>🚀 Start Test</button>
      {!socketId && <span style={{ marginLeft: 8, color: "#b8860b" }}>Connecting to backend…</span>}
      {isRunning && <span style={{ marginLeft: 10 }}>Running...</span>}
    </div>
  );
}

export default UploadForm;