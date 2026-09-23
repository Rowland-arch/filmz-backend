# filmz-backend

A complete REST API backend for the Filmz website. It includes user authentication, film data management, ratings, and reviews, all powered by a local JSON data store so the app can run without external services.

## Features

- User registration and login with JWT authentication
- Film CRUD endpoints
- Rating system from 1 to 5 stars
- User reviews
- Local JSON persistence for quick setup and demos
- Ready for local development with Node.js and Express

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Environment

Create a `.env` file in the project root:

```env
PORT=5000
JWT_SECRET=change_this_to_a_secure_secret
```

## Run the server

```bash
npm start
```

For development mode with auto-reload:

```bash
npm run dev
```

## API Overview

### Health check

```bash
GET /api/health
```

### Auth

```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

Example body for register:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### Films

```bash
GET /api/films
GET /api/films/:id
POST /api/films
PUT /api/films/:id
POST /api/films/:id/rate
POST /api/films/:id/reviews
```

### Protected endpoints

Use a Bearer token in the Authorization header:

```bash
Authorization: Bearer <token>
```

## Example film payload

```json
{
  "title": "The Matrix",
  "description": "A computer hacker learns from mysterious rebels about the true nature of his reality.",
  "releaseYear": 1999,
  "genres": ["Sci-Fi", "Action"],
  "runtime": 136,
  "director": "The Wachowskis",
  "posterUrl": "https://example.com/poster.jpg"
}
```

## Example review payload

```json
{
  "comment": "A modern classic with excellent world-building.",
  "rating": 5
}
```

## Example rating payload

```json
{
  "value": 4
}
```

## Notes

This backend uses a local JSON file at `data/db.json` instead of a database service, which makes it easy to prototype and deploy without additional infrastructure.
