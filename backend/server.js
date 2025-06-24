
const express = require("express");
const http = require("http");
const path = require("path");
const multer = require("multer");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");

const { runTest } = require("./testRunner");
const { deleteYaml } = require("../utils/kubectlHelper"); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  }
});

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../test-files");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `uploaded-${Date.now()}.yaml`);
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("yamlFile"), async (req, res) => {
  const filePath = req.file.path;
  const socketId = req.body.socketId;
  const customCmd = req.body.customCmd; 

  const clientSocket = io.sockets.sockets.get(socketId);
  if (!clientSocket) {
    return res.status(400).json({ error: "Socket not found." });
  }

  runTest(filePath, clientSocket, customCmd);

  res.status(200).json({ message: "Test started.", filePath });
});

app.post("/cleanup", async (req, res) => {
  const socketId = req.body.socketId;
  const filePath = path.join(__dirname, "../test-files", req.body.fileName);

  const clientSocket = io.sockets.sockets.get(socketId);
  if (!clientSocket) {
    return res.status(400).json({ error: "Socket not found." });
  }

  try {
    clientSocket.emit("log", "🧹 Cleaning up resources...");
    deleteYaml(filePath);
    clientSocket.emit("log", "✅ Cleanup completed.");
    clientSocket.emit("done");
    res.status(200).json({ message: "Cleanup started." });
  } catch (err) {
    clientSocket.emit("log", `❌ Cleanup failed: ${err.message}`);
    res.status(500).json({ error: "Cleanup failed." });
  }
});

app.get("/", (req, res) => {
  res.send("K8s Deployment Tester Backend Running");
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.emit("connected", { socketId: socket.id });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});