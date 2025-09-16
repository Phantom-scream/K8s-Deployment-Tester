const path = require("path");
const fs = require("fs");
const { runTest } = require("./testRunner");

let failed = false;
const socket = {
  emit: (event, payload) => {
    if (event === "log") process.stdout.write(String(payload).endsWith("\n") ? payload : payload + "\n");
    if (event === "done") {
      process.exit(failed ? 1 : 0);
    }
    if (typeof payload === "string" && (payload.includes("❌") || payload.includes("ERROR"))) {
      failed = true;
    }
  }
};

const fileArg = process.argv[2];
const customCmd = process.argv.slice(3).join(" ");

if (!fileArg || !fs.existsSync(fileArg)) {
  console.error("Usage: node backend/cli.js <yaml-file> [custom command]");
  process.exit(2);
}

runTest(path.resolve(fileArg), socket, customCmd);