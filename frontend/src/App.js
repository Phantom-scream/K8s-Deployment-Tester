import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import UploadForm from "./components/UploadForm";
import LogViewer from "./components/LogViewer";
import PodTracker from "./components/PodTracker";
import "./App.css";

const socket = io("http://localhost:4000");

function App() {
  const [socketId, setSocketId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastFilePath, setLastFilePath] = useState(null);
  const [podInfo, setPodInfo] = useState(null);

  useEffect(() => {
    socket.on("connected", ({ socketId }) => {
      setSocketId(socketId);
      console.log("Connected with socket:", socketId);
    });

    socket.on("log", (msg) => {
      setLogs((prev) => [...prev, msg]);
    });

    socket.on("done", () => {
      setIsRunning(false);
    });

    socket.on("podStatus", (payload) => setPodInfo(payload));

    return () => {
      socket.off("log");
      socket.off("connected");
      socket.off("done");
      socket.off("podStatus");
    };
  }, []);

  const handleTestStart = (filePath) => {
    setLogs([]);
    setIsRunning(true);
    setLastFilePath(filePath);
  };

  const handleCleanup = async () => {
    if (!lastFilePath || !socketId) return;
    setIsRunning(true);
    // Extract just the file name from the path
    const fileName = lastFilePath.split("/").pop();
    await axios.post("http://localhost:4000/cleanup", {
      fileName,      // <-- send fileName, not filePath
      socketId,
    });
  };

  return (
    <div className="app-container">
      <h1>K8s Deployment Tester</h1>
      <div className="tip">
        <strong>Tip:</strong> You can upload <b>any Kubernetes YAML</b> (Deployment, Service, Job, ConfigMap, etc.), including files with multiple resources separated by <code>---</code>.<br/>
        <strong>New:</strong> Optionally enter a <b>custom shell command</b> (e.g. <code>curl http://localhost:8080</code>) to run after deployment!
      </div>
      <UploadForm
        socketId={socketId}
        onTestStart={handleTestStart}
        isRunning={isRunning}
      />
      {isRunning && <p style={{ color: "#0074d9", fontWeight: 500 }}>⏳ Test is running...</p>}

      {podInfo?.pods?.length ? <PodTracker data={podInfo} /> : null}

      <button
        className="cleanup-btn"
        onClick={handleCleanup}
        disabled={!lastFilePath || isRunning}
      >
        🧹 Cleanup Resources
      </button>
      <LogViewer logs={logs} />
    </div>
  );
}

export default App;