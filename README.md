# K8s Deployment Tester

A modern web-based tool to **test, monitor, and clean up Kubernetes resources** using YAML files. Designed for developers and DevOps engineers who want to quickly validate Kubernetes manifests, observe deployment status, and optionally run custom post-deployment tests—all from a user-friendly interface.

---

## Features

- **Upload & Apply Any Kubernetes YAML**
  - Supports any Kubernetes resource (Deployment, Service, Job, ConfigMap, etc.)
  - Multi-document YAMLs (`---` separator) are supported

- **Live Log Streaming**
  - Real-time logs and status updates streamed to the frontend
  - Color-coded logs for clarity

- **Deployment Status Monitoring**
  - Waits for Deployments to become ready and shows pod readiness

- **Custom Test Commands**
  - Optionally run a shell command (e.g. `curl ...`) after deployment
  - Output is streamed to the frontend

- **Resource Cleanup**
  - One-click cleanup deletes all resources created by your YAML
  - Cleanup logs are shown in the UI

- **Modern, User-Friendly UI**
  - Clean, card-like layout with clear instructions and tips

---

## How It Works

1. **Upload** a Kubernetes YAML file (single or multi-resource).
2. **Watch logs** as each resource is applied to the cluster.
3. **See status** for Deployments (waits for pods to be ready).
4. **Optionally run** a custom shell command after deployment.
5. **Click "Cleanup Resources"** to delete everything you just created.

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm
- Access to a Kubernetes cluster (`kubectl` must be configured and available on the backend server)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/k8s-deployment-tester.git
   cd k8s-deployment-tester
   ```

2. **Install backend dependencies:**
   ```sh
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```sh
   cd ../frontend
   npm install
   ```

### Running the App

1. **Start the backend server:**
   ```sh
   cd backend
   node server.js
   ```

2. **Start the frontend:**
   ```sh
   cd ../frontend
   npm start
   ```

3. **Open your browser** and go to [http://localhost:3000](http://localhost:3000)

---

## Example YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

---

## Project Structure

```
backend/
  server.js         # Express server & Socket.IO
  testRunner.js     # Core logic for applying/testing resources
  parser.js         # YAML parsing helper
  ...
frontend/
  src/
    App.js          # Main React component
    components/
      UploadForm.js # File upload & custom command input
      LogViewer.js  # Real-time log viewer
    App.css         # Modern styling
  ...
```

---

## Who Is This For?

- Developers and DevOps engineers who want to quickly test Kubernetes YAML files
- Anyone who wants to see what their Kubernetes resources will do, without using the command line

---

## License

MIT

---

**In short:**  
This project makes it easy to upload, test, monitor, and clean up Kubernetes resources—all from a friendly web interface, with live feedback every step of the way.
