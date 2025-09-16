# K8s Deployment Tester

A web-based tool to test, monitor, and clean up Kubernetes resources using YAML files. It validates manifests, streams live logs and pod status, optionally runs post-deployment commands, and supports CI with a CLI runner and unit tests.

---

## Features

- Upload & apply any Kubernetes YAML
  - Supports multi-document YAMLs separated by `---`
- Pre-apply validation
  - Uses `kubectl apply --dry-run=client` before applying to the cluster
- Live log streaming
  - Real-time socket logs to the frontend
- Live pod tracking
  - Streams pod name, phase, restarts, and node while a Deployment becomes ready
- Custom test command
  - Optionally run a shell command (e.g., `curl ...`) after apply and stream its output
- Cleanup
  - One-click cleanup deletes all resources created by your uploaded YAML
- Pipeline-ready
  - CLI runner with exit codes for CI
  - GitHub Actions workflow for automated tests
- Tests and logging
  - Backend unit tests (Jest) for parsing and readiness logic
  - Optional per-run log files (structured logs)

---

## Architecture

- Backend (Node/Express + Socket.IO)
  - Endpoints:
    - POST `/upload` – save file and start test run
    - POST `/cleanup` – delete resources created by the uploaded file
    - GET `/` – health check
  - Core logic: `backend/testRunner.js` (validation, apply, readiness wait, pod tracking)
  - Socket events: `log`, `done`, `podStatus`
- Frontend (React + CRA)
  - Components:
    - `UploadForm` – file upload and custom command
    - `LogViewer` – real-time logs
    - `PodTracker` – live pod status
- Utilities
  - `utils/kubectlHelper.js` – apply/delete helpers for cleanup
- CI/CD
  - `.github/workflows/ci.yml` – install deps, run tests (frontend/backend)
- CLI
  - `backend/cli.js` – headless test runner for CI/local scripts

---

## Prerequisites

- Node.js 18+ and npm
- `kubectl` installed and configured to a cluster
- Optional: local cluster via KinD
  - macOS:
    - `brew install kubectl kind`
    - `kind create cluster --name k8s-deployment-tester`

Verify:
```sh
kubectl version --client --short
kubectl cluster-info
```

---

## Install

```sh
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

Notes:
- Frontend uses CRA 5 and axios 0.27.x for Jest compatibility.
- Backend uses `js-yaml` for parsing.

---

## Run (development)

```sh
cd backend
node server.js
# -> 🚀 Server running on http://localhost:4000

cd frontend
npm start
# -> open http://localhost:3000
```

Health check:
```sh
curl http://localhost:4000
```

---

## Usage (UI)

1. Start backend, then frontend.
2. Wait until the UI shows connected (Start Test button enables after socket + file).
3. Choose a YAML file (single or multi-doc) and click “Start Test”.
4. Watch logs and live pod updates (for Deployments).
5. Optionally enter a custom command (e.g., `curl http://<svc-host>:<port>`) to run after apply.
6. Click “Cleanup Resources” to delete everything applied.

Example manifest:
- `test.yaml` (single Deployment)
- `test-multi.yaml` (Service + Deployment)

---

## CLI (pipeline-ready)

Run headless (no UI) and use exit codes for CI.

```sh
node backend/cli.js ./test.yaml
node backend/cli.js ./test.yaml "kubectl get pods -A"
```

Behavior:
- Prints the same logs as the UI to stdout.
- Exits 0 on success; non-zero on failures (validation/apply/test command).

---

## Tests

Backend (Jest):
```sh
cd backend
npm test
```
- `__tests__/parser.test.js` – YAML parsing/logging
- `__tests__/waitForDeploymentReady.test.js` – readiness checks (mocks kubectl)

Frontend (CRA/Jest):
```sh
cd frontend
npm test -- --watchAll=false
```
- `src/App.test.js` – renders header and buttons, mocks socket client

---

## CI (GitHub Actions)

Workflow path:
- `.github/workflows/ci.yml`

What it does:
- Checks out code
- Installs backend/frontend dependencies
- Runs backend and frontend unit tests

Trigger:
- On push and pull_request

---

## Logging

- Live logs streamed via Socket.IO (`log` events)
- Live pod status via `podStatus` events
- Optional per-run file logging helper:
  - `backend/logger.js` writes to `run-logs/<runId>.log` (integrate where desired)

---

## Project Structure

```
backend/
  server.js
  testRunner.js
  parser.js
  cli.js
  logger.js
  __tests__/
    parser.test.js
    waitForDeploymentReady.test.js
frontend/
  src/
    App.js
    App.css
    components/
      UploadForm.js
      LogViewer.js
      PodTracker.js
.github/
  workflows/
    ci.yml
utils/
  kubectlHelper.js
test.yaml
test-multi.yaml
```

Uploads are stored under `backend/../test-files` (auto-created).

---

## Troubleshooting

- Start button disabled / “Upload a file and wait for socket to connect!”
  - Start backend first, then refresh frontend. Check browser console for socket ID.
- kubectl errors
  - Ensure kubecontext is set and cluster reachable:
    - `kubectl get nodes`
- Ports in use
  - `lsof -i :4000` then kill the process or change the port
- Frontend tests can’t parse axios ESM
  - axios pinned to `0.27.2` for CRA 5 Jest
- CI Node version
  - Workflow uses Node 20. If CRA issues arise, try Node 18.

---

## License

MIT

---

Mapping to resume bullets
- Automated deployment validation with real-time tests and cleanup
  - Dry-run validation, apply, readiness wait, and cleanup endpoint
- Live-feedback UI for YAML validation and pod tracking
  - Real-time logs + PodTracker component with status and restarts
- Pipeline-ready workflows with logging and error capture
  - CLI runner with exit codes, Jest unit tests, and GitHub
