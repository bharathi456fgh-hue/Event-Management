# Gather Event Management

An event operations dashboard with an Express API and a MongoDB database accessed through Mongoose.

## Requirements

- Node.js 22.13 or newer
- MongoDB Community Server running locally, or a MongoDB Atlas connection URI
- npm

## Run locally

```powershell
npm install
npm start
```

The default connection is `mongodb://127.0.0.1:27017/event_management`. Start the MongoDB server, then start the app:

```powershell
npm install
npm start
```

In MongoDB Compass, connect using `mongodb://127.0.0.1:27017` and open the `event_management` database. The app creates and seeds its collections on first start. Open `http://localhost:3000` to use the dashboard.

When `index.html` is opened directly, event ratings and task checklist changes (including adding tasks) are saved in that browser. Use Ratings in the sidebar to view and update event scores. Other data changes and shared database sync require the backend.

To use a different local URI or MongoDB Atlas, set `MONGODB_URI` before starting the app:

```powershell
$env:MONGODB_URI = "your-mongodb-connection-uri"
npm start
```

## Deployment

This project is ready to deploy as a Node.js app with MongoDB. For a containerized deployment:

```bash
docker compose up --build
```

This starts the app on port `3000` and launches a MongoDB container automatically. Use the sample settings in `.env.example` or set these environment variables in your deployment platform:

```bash
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/event_management
NODE_ENV=production
```

For a hosted environment such as Render, Railway, or Azure App Service, set `MONGODB_URI` to your managed MongoDB connection string and keep `PORT` as provided by the platform.

## API

- `GET /api/health`
- `GET, POST /api/events`; `DELETE /api/events/:id`; `PATCH /api/events/:id/rating`
- `GET, POST /api/guests`
- `GET, POST /api/vendors`
- `GET, POST /api/tasks`; `PATCH /api/tasks/:id`
- `GET, PUT /api/settings`

The API is intended for local development and does not include authentication or public deployment hardening.
