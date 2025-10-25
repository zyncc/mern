## 1. Backend Setup

### A. Installation and Building

```bash
cd backend

```

```bash
npm install
```

```bash
npm run build
```

### B. Configuration

The server requires environment variables to run.

1.  Locate the sample environment file in the backend directory.
2.  Create a new file named **`.env`** in the same `backend` directory.
3.  Copy the contents of **`.env.example`** into your new **`.env`** file and update the variables as needed.

### C. Running the Server

Start the backend server using the following command:

```bash
npm run start
```

The server should now be running and accessible at `http://localhost:8080`.

---

## 2. Frontend Setup (Client)

The frontend client will run on port **3000**.

### A. Installation and Building

Navigate to the `frontend` directory and install dependencies, then build the project:

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run build
```

### B. Configuration

The frontend also requires environment variables, typically to point to the backend server URL.

1.  Navigate to the `frontend` directory.
2.  Locate the sample environment file (e.g., `.env.example`).
3.  Create or update the appropriate environment file (usually **`.env`**) in the `frontend` directory and ensure the necessary variables are correctly set.

### C. Running the Client

Start the frontend development server using the following command:

```bash
npm run start
```

The application should now be running and accessible in your browser at `http://localhost:3000`.

---

## 3. Datasets for Testing

Two dataset files are provided in the root directory for testing data ingestion and functionality:

- `data.csv`
- `data.xlsx`

You may use these files to test endpoints related to data upload and processing.
