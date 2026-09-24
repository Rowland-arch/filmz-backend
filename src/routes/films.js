const express = require('express');
const crypto = require('crypto');
const { readData, writeData, getAverageRating } = require('../store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
function normalizeGenres(genres) { return Array.isArray(genres) ? genres.map(String).map((g) => g.trim()).filter(Boolean) : String(genres || '').split(',').map((g) => g.trim()).filter(Boolean); }
function serializeFilm(film, ratings, reviews) { return { ...film, averageRating: getAverageRating(film.id, ratings), ratingCount: ratings.filter((r) => r.filmId === film.id).length, reviews: reviews.filter((r) => r.filmId === film.id) }; }

router.get('/', (req, res) => {
  const { genre, search, featured } = req.query; const data = readData();
  let films = data.films.map((film) => serializeFilm(film, data.ratings, data.reviews));
  if (genre) films = films.filter((film) => film.genres.includes(String(genre)));
  if (search) { const q = String(search).toLowerCase(); films = films.filter((film) => `${film.title} ${film.vj || ''} ${film.genres.join(' ')} ${film.language || ''}`.toLowerCase().includes(q)); }
  if (featured === 'true') films = films.filter((film) => film.featured || film.isPublished);
  res.json({ films });
});

router.get('/:id', (req, res) => {
  const data = readData(); const film = data.films.find((entry) => entry.id === req.params.id);
  if (!film) return res.status(404).json({ message: 'Film not found' });
  res.json({ film: serializeFilm(film, data.ratings, data.reviews) });
});

function filmPayload(body, old = {}) {
  return { ...old, title: String(body.title || old.title || '').trim(), description: String(body.description || old.description || '').trim(), releaseYear: Number(body.releaseYear || old.releaseYear || 0), genres: body.genres === undefined ? (old.genres || []) : normalizeGenres(body.genres), runtime: Number(body.runtime || old.runtime || 0), director: body.director ?? old.director ?? '', posterUrl: body.posterUrl ?? old.posterUrl ?? '', backdropUrl: body.backdropUrl || body.posterUrl || old.backdropUrl || old.posterUrl || '', videoUrl: body.videoUrl ?? old.videoUrl ?? '', downloadUrl: body.downloadUrl ?? old.downloadUrl ?? '', trailerUrl: body.trailerUrl ?? old.trailerUrl ?? '', vj: body.vj || old.vj || 'Great HD', language: body.language || old.language || 'English', featured: typeof body.featured === 'boolean' ? body.featured : Boolean(old.featured), isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : old.isPublished !== false };
}

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const data = readData(); const film = filmPayload(req.body);
  if (!film.title || !film.description || !film.releaseYear || !film.genres.length) return res.status(400).json({ message: 'Title, description, releaseYear and genres are required' });
  film.id = crypto.randomUUID(); film.createdAt = new Date().toISOString(); film.updatedAt = film.createdAt;
  data.films.push(film); writeData(data); res.status(201).json({ message: 'Film created successfully', film: serializeFilm(film, data.ratings, data.reviews) });
});

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const data = readData(); const index = data.films.findIndex((film) => film.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Film not found' });
  const film = filmPayload(req.body, data.films[index]); film.id = req.params.id; film.createdAt = data.films[index].createdAt; film.updatedAt = new Date().toISOString(); data.films[index] = film; writeData(data);
  res.json({ message: 'Film updated successfully', film: serializeFilm(film, data.ratings, data.reviews) });
});

router.post('/:id/rate', requireAuth, (req, res) => {
  const value = Number(req.body.value); const data = readData();
  if (!Number.isInteger(value) || value < 1 || value > 5) return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  if (!data.films.some((film) => film.id === req.params.id)) return res.status(404).json({ message: 'Film not found' });
  const existing = data.ratings.find((r) => r.filmId === req.params.id && r.userId === req.user.userId);
  if (existing) { existing.value = value; existing.updatedAt = new Date().toISOString(); } else data.ratings.push({ id: crypto.randomUUID(), filmId: req.params.id, userId: req.user.userId, value, createdAt: new Date().toISOString() });
  writeData(data); res.json({ message: 'Rating saved', averageRating: getAverageRating(req.params.id, data.ratings), ratingCount: data.ratings.filter((r) => r.filmId === req.params.id).length, userRating: value });
});

router.post('/:id/reviews', requireAuth, (req, res) => {
  const comment = String(req.body.comment || '').trim(); const data = readData(); const user = data.users.find((u) => u.id === req.user.userId);
  if (!data.films.some((film) => film.id === req.params.id)) return res.status(404).json({ message: 'Film not found' });
  if (!comment) return res.status(400).json({ message: 'Review comment is required' });
  const rating = req.body.rating ? Number(req.body.rating) : null; if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return res.status(400).json({ message: 'Review rating must be between 1 and 5' });
  const review = { id: crypto.randomUUID(), filmId: req.params.id, userId: req.user.userId, userName: user?.name || 'Member', comment, rating, createdAt: new Date().toISOString() }; data.reviews.push(review); writeData(data); res.status(201).json({ message: 'Review added successfully', review });
});
module.exports = router;
