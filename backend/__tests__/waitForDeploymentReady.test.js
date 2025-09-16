jest.mock("child_process", () => ({ exec: jest.fn() }));

const { exec } = require("child_process");
const { waitForDeploymentReady } = require("../testRunner");

const logs = [];
const socket = {
  emit: (event, payload) => {
    if (event === "log") logs.push(String(payload));
  },
};

beforeEach(() => {
  logs.length = 0;
  exec.mockReset();
});

test("resolves true and logs ready when deployment is ready", async () => {
  exec.mockImplementation((cmd, cb) => {
    const dep = { status: { replicas: 1, availableReplicas: 1 } };
    cb(null, JSON.stringify(dep));
  });

  const ok = await waitForDeploymentReady("nginx", "default", socket, 1000);
  expect(ok).toBe(true);
  expect(logs.some(l => l.includes("is ready"))).toBe(true);
});

test("resolves false and logs on kubectl error", async () => {
  exec.mockImplementation((cmd, cb) => cb(new Error("boom")));

  const ok = await waitForDeploymentReady("nginx", "default", socket, 1000);
  expect(ok).toBe(false);
  expect(logs.some(l => l.includes("Failed to get deployment status"))).toBe(true);
});

test("resolves false and logs on bad JSON", async () => {
  exec.mockImplementation((cmd, cb) => cb(null, "not-json"));

  const ok = await waitForDeploymentReady("nginx", "default", socket, 1000);
  expect(ok).toBe(false);
  expect(logs.some(l => l.includes("Could not parse deployment status"))).toBe(true);
});