# Great HD

Great HD is a cinematic movie streaming and download platform for authorized Ugandan translated content. The design is built for a modern streaming experience, but it remains safe and responsible by requiring content to be approved and legally allowed to be published.

## Features

- Cinematic streaming-style homepage
- Search and genre filtering
- VJ showcase sections
- Movie detail modals with watch and download actions
- Member sign-in form
- Admin publishing modal for authorized uploads
- Express API with film and auth endpoints
- Ready for deployment to Render or similar hosting providers

## Run locally

```bash
npm install
npm start
```

Then open this in Chrome:

```text
http://localhost:5000
```

## Environment variables

Create a `.env` file from the example if needed:

```bash
cp .env.example .env
```

Example content:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
```

## API overview

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/films`
- `GET /api/films/:id`
- `POST /api/films` — requires Bearer token
- `PUT /api/films/:id` — requires Bearer token
- `POST /api/films/:id/rate` — requires Bearer token
- `POST /api/films/:id/reviews` — requires Bearer token

## Deployment

This project includes a Render blueprint file for quick hosting:

```text
render.yaml
```

### Deploy on Render

1. Push this repository to GitHub.
2. Sign in to Render.
3. Choose New → Blueprint.
4. Select the repository.
5. Render will install dependencies and build the app automatically.

## Important note

Great HD should only publish movies, artwork, trailers, and downloads for which the administrator has legal permission to distribute. The design may follow the feel of modern streaming platforms, but do not copy proprietary branding, code, or copyrighted assets from other sites.
