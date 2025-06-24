const fs = require("fs");
const { exec } = require("child_process");
const yaml = require("js-yaml");
const { parseYAML } = require("./parser");

/**
 * Runs a Kubernetes deployment test and sends log output via socket
 * @param {string} yamlPath - Path to the uploaded YAML file
 * @param {Socket} socket - Socket.IO client socket
 */
function runTest(yamlPath, socket, customCmd) {
  socket.emit("log", `📄 Using YAML: ${yamlPath}`);

  socket.emit("log", "🔍 Parsing YAML file...");
  const content = fs.readFileSync(yamlPath, "utf-8");
  const docs = yaml.loadAll(content);

  if (!docs.length) {
    socket.emit("log", "❌ No valid YAML documents found.");
    return;
  }

  socket.emit("log", `🧩 Found ${docs.length} resource${docs.length > 1 ? "s" : ""} in the YAML.`);

  let completed = 0;
  docs.forEach((doc, idx) => {
    if (!doc || !doc.kind || !doc.metadata?.name) {
      socket.emit("log", `❌ Document ${idx + 1}: Invalid YAML structure.`);
      completed++;
      if (completed === docs.length) runCustomCmd();
      return;
    }

    const tempPath = `${yamlPath}-doc${idx + 1}.yaml`;
    fs.writeFileSync(tempPath, yaml.dump(doc));

    socket.emit("log", `\n📦 [${doc.kind}] "${doc.metadata.name}" (Document ${idx + 1})`);
    socket.emit("log", `➡️  Applying resource to the cluster...`);
    const deployCmd = `kubectl apply -f ${tempPath}`;
    const child = exec(deployCmd);

    child.stdout.on("data", (data) => {
      socket.emit("log", data.toString());
    });

    child.stderr.on("data", (data) => {
      socket.emit("log", `❗ ERROR: ${data.toString()}`);
    });

    child.on("exit", async (code) => {
      if (code === 0) {
        socket.emit("log", `✅ [${doc.kind}] "${doc.metadata.name}" applied successfully.`);
        if (doc.kind === "Deployment") {
          socket.emit("log", `⏳ Waiting for Deployment "${doc.metadata.name}" to be ready...`);
          await waitForDeploymentReady(doc.metadata.name, doc.metadata.namespace || "default", socket);
        }
      } else {
        socket.emit("log", `❌ [${doc.kind}] "${doc.metadata.name}" failed with code ${code}`);
      }
      socket.emit("log", `🗑️  Cleaning up temp file for "${doc.metadata.name}"`);
      fs.unlinkSync(tempPath);
      completed++;
      if (completed === docs.length) runCustomCmd();
    });
  });

  function runCustomCmd() {
    if (customCmd && customCmd.trim()) {
      socket.emit("log", `\n🔧 Running custom test command: ${customCmd}`);
      const custom = exec(customCmd);
      custom.stdout.on("data", (data) => socket.emit("log", `[custom stdout] ${data.toString()}`));
      custom.stderr.on("data", (data) => socket.emit("log", `[custom stderr] ${data.toString()}`));
      custom.on("exit", (code) => {
        if (code === 0) {
          socket.emit("log", "✅ Custom test command completed successfully.");
        } else {
          socket.emit("log", `❌ Custom test command failed with code ${code}`);
        }
        socket.emit("done");
      });
    } else {
      socket.emit("done");
    }
  }
}

function waitForDeploymentReady(name, namespace = "default", socket, timeout = 60000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const cmd = `kubectl get deployment ${name} -n ${namespace} -o json`;
      exec(cmd, (err, stdout) => {
        if (err) {
          socket.emit("log", `❗ ERROR: Failed to get deployment status for ${name}`);
          return resolve(false);
        }
        try {
          const dep = JSON.parse(stdout);
          const desired = dep.status.replicas || 0;
          const available = dep.status.availableReplicas || 0;
          if (desired > 0 && desired === available) {
            socket.emit("log", `✅ Deployment "${name}" is ready (${available}/${desired} pods available).`);
            return resolve(true);
          } else {
            if (Date.now() - start > timeout) {
              socket.emit("log", `❌ Deployment "${name}" not ready after ${timeout / 1000}s.`);
              return resolve(false);
            }
            setTimeout(check, 2000);
          }
        } catch (e) {
          socket.emit("log", `❗ ERROR: Could not parse deployment status for ${name}`);
          return resolve(false);
        }
      });
    };
    check();
  });
}

module.exports = { runTest, waitForDeploymentReady };