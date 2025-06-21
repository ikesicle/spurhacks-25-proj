# Docker Setup Instructions

This project includes Docker configurations for both backend and frontend services.

## Prerequisites

- Docker and Docker Compose installed
- Google API Key for Gemini (set as environment variable)

## Project Structure

```
├── backend/
│   ├── Dockerfile          # Backend Docker configuration
│   └── .dockerignore       # Files to exclude from Docker build
├── frontend/
│   ├── Dockerfile          # Frontend Docker configuration
│   ├── nginx.conf          # Nginx configuration for production
│   └── .dockerignore       # Files to exclude from Docker build
├── docker-compose.yml      # Production orchestration
└── docker-compose.dev.yml  # Development orchestration with hot reload
```

## Development Setup

For development with hot reload:

```bash
# Set your Google API key
export GOOGLE_API_KEY="your-api-key-here"

# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- Backend on http://localhost:8000 (with hot reload)
- Frontend on http://localhost:5173 (with hot reload)
- MongoDB on localhost:27017

## Production Setup

For production deployment:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will start:
- Backend API on http://localhost:8000
- Frontend on http://localhost:80
- MongoDB on localhost:27017

The frontend nginx server will proxy API requests from `/api/*` to the backend service.

## Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (including database data)
docker-compose down -v

# View logs
docker-compose logs -f [service-name]

# Rebuild a specific service
docker-compose build [service-name]

# Execute commands in a running container
docker-compose exec backend bash
docker-compose exec frontend sh

# Run only specific services
docker-compose up backend mongo
```

## Environment Variables

### Backend
- `DATABASE_URL`: MongoDB connection string (default: `mongodb://mongo:27017/scripts_db`)
- `GOOGLE_API_KEY`: Your Google Gemini API key (required)

### Frontend
- In development, the API URL is configured via Vite
- In production, nginx proxies `/api/*` requests to the backend

## Troubleshooting

1. **Port conflicts**: If you see port binding errors, make sure no other services are running on ports 80, 8000, 5173, or 27017.

2. **CORS issues**: The backend is configured to allow CORS from localhost URLs. Update the allowed origins in `backend/app/main.py` if needed.

3. **Database connection**: Ensure MongoDB is fully started before the backend tries to connect. Docker Compose handles this with `depends_on`.

4. **API connection in frontend**: The frontend uses relative paths in production (`/api`) and absolute URLs in development.

## Notes

- The development setup mounts local directories for hot reload
- The production setup uses multi-stage builds for optimized images
- Database data persists in Docker volumes between restarts
- To fully reset the database, use `docker-compose down -v` 