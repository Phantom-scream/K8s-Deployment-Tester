const fs = require("fs");
const path = require("path");

function createRunLogger(runId) {
  const dir = path.join(__dirname, "../run-logs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${runId}.log`);
  return {
    info: (msg) => fs.appendFileSync(file, `[INFO] ${new Date().toISOString()} ${msg}\n`),
    error: (msg) => fs.appendFileSync(file, `[ERROR] ${new Date().toISOString()} ${msg}\n`),
    path: file
  };
}

module.exports = { createRunLogger };