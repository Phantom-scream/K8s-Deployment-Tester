const { execSync } = require("child_process");

function applyYaml(filePath) {
  try {
    const output = execSync(`kubectl apply -f ${filePath}`);
    console.log("[YAML Applied]:\n" + output.toString());
  } catch (err) {
    console.error("Failed to apply YAML:", err.stderr.toString());
  }
}

function getPodStatus(label) {
  try {
    const output = execSync(`kubectl get pods -l app=${label} -o json`);
    const pods = JSON.parse(output.toString()).items;
    if (pods.length === 0) return null;

    const pod = pods[0];
    return {
      name: pod.metadata.name,
      phase: pod.status.phase,
    };
  } catch (err) {
    console.error("Error getting pod status:", err.stderr?.toString());
    return null;
  }
}

function deleteYaml(filePath) {
  try {
    execSync(`kubectl delete -f ${filePath}`);
    console.log("Deployment cleaned up.");
  } catch (err) {
    console.error("Cleanup failed:", err.stderr.toString());
  }
}

module.exports = { applyYaml, getPodStatus, deleteYaml };