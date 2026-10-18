# task-manager
# MERN Task Manager

A full-stack Task Manager application built with the **MERN stack** — MongoDB, Express.js, React, and Node.js. Manage tasks, track priorities and due dates, and monitor task progress through a responsive dashboard.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-API-black?logo=express" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite" alt="Vite" />
</p>

## Features

- **Task Management:** Create, view, update, and delete tasks.
- **Task Status:** Track the progress of tasks.
- **Priority Levels:** Organize tasks by priority.
- **Due Dates:** Set deadlines for tasks.
- **Search and Filtering:** Find tasks quickly using available filters.
- **Dashboard Statistics:** View task counts and progress.
- **Responsive Design:** Access the application on desktop and mobile devices.
- **REST API:** Connect the React frontend to the Express backend.
- **MongoDB Integration:** Persist task data using MongoDB and Mongoose.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development and build tooling |
| Axios | HTTP requests to the backend |
| Lucide React | Icons |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| dotenv | Environment configuration |

## Project Structure

```text
mern-task-manager/
├── client/
│   ├── public/
│   ├── src/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   └── taskRoutes.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── package.json
└── README.md
```

## Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB server

## Getting Started

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd mern-task-manager
```

Replace `<your-github-repository-url>` with your actual GitHub repository URL.

### 2. Install dependencies

Run this command from the project root:

```bash
npm run install:all
```

This installs dependencies for the root project, frontend, and backend.

### 3. Configure environment variables

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

Replace `your_mongodb_connection_string` with your MongoDB connection string.

> **Important:** Never commit your `.env` file or publish database credentials to GitHub.

### 4. Run the application

From the root `mern-task-manager` directory, execute:

```bash
npm run dev
```

This starts the frontend and backend concurrently in the same terminal.

### 5. Open the application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

The backend URL is the base address. Available API endpoints depend on the routes implemented in the server.

## Available Commands

Run these commands from the root directory:

| Command | Description |
|---|---|
| `npm run install:all` | Install all dependencies |
| `npm run dev` | Start frontend and backend together |
| `npm run client` | Start only the frontend |
| `npm run server` | Start only the backend |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the backend |

## API Operations

The backend is designed to support task-related REST operations.

| HTTP Method | Operation |
|---|---|
| `GET` | Retrieve tasks |
| `POST` | Create a task |
| `PUT` / `PATCH` | Update a task |
| `DELETE` | Delete a task |

For the exact endpoint URLs and request formats, see `server/src/routes/taskRoutes.js`.

## Production Build

Build the frontend with:

```bash
npm run build
```

The production frontend files will be generated in:

```text
client/dist/
```

Frontend hosting and production backend deployment must be configured separately unless you explicitly configure Express to serve the built frontend.

## Future Enhancements

- User authentication and authorization
- User-specific task ownership
- Email reminders for upcoming deadlines
- Team collaboration and task assignment
- Automated testing
- Pagination for large task lists

## Security

- Store sensitive credentials in environment variables.
- Add `.env` to `.gitignore`.
- Validate incoming API requests.
- Implement authentication and authorization before storing private, user-specific tasks.
- Configure CORS appropriately for production.

## License

This project was created for learning, development, and assessment purposes. Add a license file if you intend to distribute it under a specific open-source license.
