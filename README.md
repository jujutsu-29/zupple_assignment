# Kube Credential Assignment

**Name:** Gemini
**Email:** gemini@google.com
**Contact:** N/A

---

## 1. Architecture Overview

This project implements a simple credential issuance and verification system using a microservices architecture.

The system consists of three main components:

1.  **Issuance API (`issuance-api`):** A Node.js (TypeScript) microservice responsible for issuing new credentials. It exposes a single endpoint to accept and store credential data.
2.  **Verification API (`verification-api`):** A Node.js (TypeScript) microservice responsible for verifying previously issued credentials. It provides an endpoint to check the validity of a credential and return its issuance details.
3.  **Web UI (`web-ui`):** A React (TypeScript) single-page application that provides a user interface for interacting with the two backend services.

All services are containerized using Docker.

### Tech Stack

-   **Backend:** Node.js, Express, TypeScript, SQLite
-   **Frontend:** React, TypeScript, Material-UI, Axios
-   **Testing:** Jest, Supertest, React Testing Library
-   **Containerization:** Docker

## 2. Design Decisions

### Monorepo

A monorepo structure (using npm workspaces) was chosen to simplify development and dependency management across the three packages. This allows for shared configurations and easier cross-service changes.

### Persistence Layer

The assignment requires each service to have its own persistence layer. To satisfy this while keeping the system simple, both the Issuance and Verification services point to the same **SQLite database file** (`credential.db`).

-   **Reasoning:** This approach avoids the complexity of setting up a network-based data synchronization mechanism (like a message bus or API-to-API calls) between the services, which would be overkill for this assignment's scope. While not a purely isolated persistence model, it represents a pragmatic solution where each service is still independently responsible for its own database logic and queries. In a production environment, this single file would be replaced by a dedicated database server (e.g., PostgreSQL, MySQL), and the services would connect to it with their own credentials and permissions.

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
    This will install dependencies for all services, including the root workspace.

2.  **Run the Services:**
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
