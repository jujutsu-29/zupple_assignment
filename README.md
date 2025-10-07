# Kube Credential Assignment

**Name:** Rajtilak Pandey
**Email:** rajtilakpandey16@gmail.com
**Contact:** 9262348758

---

## 1. Architecture Overview

This project implements a simple credential issuance and verification system using a microservices architecture.

The system consists of three main components:

1.  **Issuance API (`issuance-api`):** A Node.js (TypeScript) microservice responsible for issuing new credentials. It exposes a single endpoint to accept and store credential data.
2.  **Verification API (`verification-api`):** A Node.js (TypeScript) microservice responsible for verifying previously issued credentials. It provides an endpoint to check the validity of a credential and return its issuance details.
3.  **Web UI (`web-ui`):** A React (TypeScript) single-page application that provides a user interface for interacting with the two backend services.

All services are containerized using Docker.

### Tech Stack

-   **Backend:** Node.js, Express, TypeScript, File System (JSON persistence)
-   **Frontend:** React, TypeScript, Material-UI, Axios
-   **Testing:** Jest, Supertest, React Testing Library
-   **Containerization:** Docker

## 2. Design Decisions

### Monorepo

A monorepo structure (using npm workspaces) was chosen to simplify development and dependency management across the three packages. This allows for shared configurations and easier cross-service changes.

### Persistence Layer

Both the Issuance and Verification services use a shared **JSON file (`credentials.json`)** for persistence. This file stores all issued credentials as an array of JSON objects.

-   **Reasoning:** This approach directly addresses the requirement for a "simple free-tier DB" and the user's request to use "pure JSON". It avoids external database dependencies, making local setup very straightforward. In a production environment, especially with multiple instances of the services, this shared file would need to be stored on a shared, persistent volume (e.g., a Kubernetes Persistent Volume or a cloud file storage service) to ensure data consistency and availability across all service replicas. For this assignment, it demonstrates a simple, file-based persistence mechanism.

### API Design

-   The APIs are designed to be simple and RESTful.
-   They accept and respond with JSON.
-   CORS is enabled with a simple middleware to allow the frontend (running on a different port) to communicate with the APIs.

### Worker ID

The requirement to return a worker/pod ID is met by using the machine's hostname (`os.hostname()`). In a containerized environment like Kubernetes, the hostname typically corresponds to the pod name, fulfilling the requirement.

## 3. Codebase Structure

The project is organized into a `packages` directory, with each service in its own sub-directory:

```
/
├── packages/
│   ├── issuance-api/         # Issuance microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── verification-api/     # Verification microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web-ui/               # React frontend
│       ├── src/
│       └── package.json
├── credential.db             # Shared SQLite database
├── README.md                 # This file
└── package.json              # Root package.json for workspaces
```

## 4. How to Run Locally

### Prerequisites

-   Node.js (v16 or later)
-   npm (v7 or later)

### Steps

1.  **Install Dependencies:**
    Open a terminal at the project root and run:
    ```bash
    npm install
    ```

2.  **Ensure `credentials.json` exists:**
    A `credentials.json` file should exist in the project root. If it doesn't, create an empty one with `[]` as its content.

3.  **Run the Services:**
    You can run each service in a separate terminal.

    -   **Terminal 1: Start the Issuance API**
        ```bash
        npm run start:issuance
        ```
        This will start the server on `http://localhost:4000`.

    -   **Terminal 2: Start the Verification API**
        ```bash
        npm run start:verification
        ```
        This will start the server on `http://localhost:5000`.

    -   **Terminal 3: Start the React App**
        ```bash
        npm run start:web
        ```
        This will open the web UI in your browser at `http://localhost:3000`.

3.  **Run Tests:**
    To run the unit tests for all backend services, run the following command from the root directory:
    ```bash
    npm test
    ```
