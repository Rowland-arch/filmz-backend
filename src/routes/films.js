const express = require('express');
const crypto = require('crypto');
const { readData, writeData, getAverageRating } = require('../store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function normalizeGenres(genres) {
  if (!genres) return [];
  if (Array.isArray(genres)) {
    return genres.map((genre) => String(genre).trim()).filter(Boolean);
  }
  return String(genres)
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean);
}

function serializeFilm(film, ratings, reviews) {
  return {
    ...film,
    averageRating: getAverageRating(film.id, ratings),
    ratingCount: ratings.filter((entry) => entry.filmId === film.id).length,
    reviews: reviews.filter((review) => review.filmId === film.id)
  };
}

router.get('/', (req, res) => {
  const { genre, search, featured } = req.query;
  const data = readData();
  let films = data.films.map((film) => serializeFilm(film, data.ratings, data.reviews));

  if (genre) {
    films = films.filter((film) => (film.genres || []).includes(String(genre)));
  }

  if (search) {
    const query = String(search).toLowerCase();
    films = films.filter((film) => {
      const text = `${film.title} ${film.vj || ''} ${(film.genres || []).join(' ')} ${film.language || ''}`.toLowerCase();
      return text.includes(query);
    });
  }

  if (featured === 'true') {
    films = films.filter((film) => film.featured === true || film.isPublished === true);
  }

  return res.json({ films });
});

router.get('/:id', (req, res) => {
  const data = readData();
  const film = data.films.find((entry) => entry.id === req.params.id);

  if (!film) {
    return res.status(404).json({ message: 'Film not found' });
  }

  return res.json({
    film: serializeFilm(film, data.ratings, data.reviews)
  });
});

router.post('/', requireAuth, (req, res) => {
  const {
    title,
    description,
    releaseYear,
    genres,
    runtime,
    director,
    posterUrl,
    videoUrl,
    downloadUrl,
    trailerUrl,
    backdropUrl,
    vj,
    language,
    featured,
    isPublished
  } = req.body;

  if (!title || !description || !releaseYear || !genres) {
    return res.status(400).json({
      message: 'Title, description, releaseYear and genres are required'
    });
  }

  const data = readData();
  const film = {
    id: crypto.randomUUID(),
    title,
    description,
    releaseYear: Number(releaseYear),
    genres: normalizeGenres(genres),
    runtime: Number(runtime || 0),
    director: director || '',
    posterUrl: posterUrl || '',
    backdropUrl: backdropUrl || posterUrl || '',
    videoUrl: videoUrl || '',
    downloadUrl: downloadUrl || '',
    trailerUrl: trailerUrl || '',
    vj: vj || 'Great HD',
    language: language || 'English',
    featured: Boolean(featured),
    isPublished: typeof isPublished === 'boolean' ? isPublished : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.films.push(film);
  writeData(data);

  return res.status(201).json({
    message: 'Film created successfully',
    film: serializeFilm(film, data.ratings, data.reviews)
  });
});

router.put('/:id', requireAuth, (req, res) => {
  const {
    title,
    description,
    releaseYear,
    genres,
    runtime,
    director,
    posterUrl,
    videoUrl,
    downloadUrl,
    trailerUrl,
    backdropUrl,
    vj,
    language,
    featured,
    isPublished
  } = req.body;
  const data = readData();
  const filmIndex = data.films.findIndex((entry) => entry.id === req.params.id);

  if (filmIndex === -1) {
    return res.status(404).json({ message: 'Film not found' });
  }

  const film = data.films[filmIndex];
  const updatedFilm = {
    ...film,
    title: title || film.title,
    description: description || film.description,
    releaseYear: releaseYear ? Number(releaseYear) : film.releaseYear,
    genres: genres ? normalizeGenres(genres) : film.genres,
    runtime: runtime ? Number(runtime) : film.runtime,
    director: director || film.director,
    posterUrl: posterUrl || film.posterUrl,
    backdropUrl: backdropUrl || posterUrl || film.backdropUrl || film.posterUrl,
    videoUrl: videoUrl || film.videoUrl || '',
    downloadUrl: downloadUrl || film.downloadUrl || '',
    trailerUrl: trailerUrl || film.trailerUrl || '',
    vj: vj || film.vj || 'Great HD',
    language: language || film.language || 'English',
    featured: typeof featured === 'boolean' ? featured : film.featured,
    isPublished: typeof isPublished === 'boolean' ? isPublished : film.isPublished,
    updatedAt: new Date().toISOString()
  };

  data.films[filmIndex] = updatedFilm;
  writeData(data);

  return res.json({
    message: 'Film updated successfully',
    film: serializeFilm(updatedFilm, data.ratings, data.reviews)
  });
});

router.post('/:id/rate', requireAuth, (req, res) => {
  const { value } = req.body;
  const ratingValue = Number(value);

  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }

  const data = readData();
  const film = data.films.find((entry) => entry.id === req.params.id);

  if (!film) {
    return res.status(404).json({ message: 'Film not found' });
  }

  const existingRating = data.ratings.find(
    (entry) => entry.filmId === req.params.id && entry.userId === req.user.userId
  );

  if (existingRating) {
    existingRating.value = ratingValue;
    existingRating.updatedAt = new Date().toISOString();
  } else {
    data.ratings.push({
      id: crypto.randomUUID(),
      filmId: req.params.id,
      userId: req.user.userId,
      value: ratingValue,
      createdAt: new Date().toISOString()
    });
  }

  const averageRating = getAverageRating(req.params.id, data.ratings);
  const ratingCount = data.ratings.filter((entry) => entry.filmId === req.params.id).length;

  film.ratingAverage = averageRating;
  film.ratingCount = ratingCount;
  film.updatedAt = new Date().toISOString();

  writeData(data);

  return res.json({
    message: 'Rating saved',
    averageRating,
    ratingCount,
    userRating: ratingValue
  });
});

router.post('/:id/reviews', requireAuth, (req, res) => {
  const { comment, rating } = req.body;
  const data = readData();
  const film = data.films.find((entry) => entry.id === req.params.id);

  if (!film) {
    return res.status(404).json({ message: 'Film not found' });
  }

  if (!comment || comment.trim() === '') {
    return res.status(400).json({ message: 'Review comment is required' });
  }

  const user = data.users.find((entry) => entry.id === req.user.userId);
  const review = {
    id: crypto.randomUUID(),
    filmId: req.params.id,
    userId: req.user.userId,
    userName: user ? user.name : 'Unknown user',
    comment: comment.trim(),
    rating: rating ? Number(rating) : null,
    createdAt: new Date().toISOString()
  };

  data.reviews.push(review);

  if (review.rating && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5) {
    const existingRating = data.ratings.find(
      (entry) => entry.filmId === req.params.id && entry.userId === req.user.userId
    );

    if (existingRating) {
      existingRating.value = review.rating;
      existingRating.updatedAt = new Date().toISOString();
    } else {
      data.ratings.push({
        id: crypto.randomUUID(),
        filmId: req.params.id,
        userId: req.user.userId,
        value: review.rating,
        createdAt: new Date().toISOString()
      });
    }
  }

  writeData(data);

  return res.status(201).json({
    message: 'Review added successfully',
    review
  });
});

module.exports = router;
