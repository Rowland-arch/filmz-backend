# Great HD deployment guide

## Render setup

1. Push this repo to GitHub.
2. Login to Render.
3. Select New → Blueprint.
4. Point Render to this repository.
5. Confirm the app is built and deployed.

The app serves both the API and the frontend from the same Node.js service. The health check route is `/api/health`.

## Production checklist

- Replace the demo movie data with licensed content only.
- Set a strong JWT secret in the host environment.
- Store video files in a proper object store or CDN.
- Add user roles and validation for admin uploads.
- Add copyright reporting and content takedown flows before making it public.
