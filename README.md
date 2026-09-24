# Great HD

Great HD is a cinematic frontend and Express backend foundation for a permission-based Ugandan translated movie platform. The site is designed for licensed or public-domain content only.

## Run locally

```bash
npm install
cp .env.example .env # if you create one; set a strong JWT_SECRET
npm start
```

Open `http://localhost:5000` in Chrome. The homepage works in demo mode immediately and loads films from `GET /api/films` when the backend has data.

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/films`
- `GET /api/films/:id`
- `POST /api/films` (Bearer token required)
- `PUT /api/films/:id` (Bearer token required)
- Ratings and reviews are available on the existing film routes.

## Content and deployment

The demo artwork and titles are placeholders. Replace them with content and artwork you are authorized to distribute. For production, use object storage for video files, a database instead of the local JSON store, HTTPS, a strong JWT secret, administrator roles, upload validation, rate limiting, and a formal copyright/takedown process.
