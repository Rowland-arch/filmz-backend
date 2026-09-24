const demoMovies = [
  {
    id: 'demo-1',
    title: 'The Last Kingdom',
    vj: 'VJ Ice P',
    genres: ['Action', 'Drama'],
    year: 2026,
    rating: '4.9',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80',
    description: 'A fearless journey through loyalty, family and the price of power.',
    language: 'English',
    trailerUrl: 'https://example.com/trailer-1'
  },
  {
    id: 'demo-2',
    title: 'Shadow House',
    vj: 'VJ Junior',
    genres: ['Horror', 'Thriller'],
    year: 2025,
    rating: '4.7',
    poster: 'https://images.unsplash.com/photo-1505635552518-3448ca4f1e41?auto=format&fit=crop&w=700&q=80',
    description: 'Some doors should never be opened after midnight.',
    language: 'English',
    trailerUrl: 'https://example.com/trailer-2'
  },
  {
    id: 'demo-3',
    title: 'Kampala Sunset',
    vj: 'VJ Mark',
    genres: ['Drama', 'Romance'],
    year: 2025,
    rating: '4.8',
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
    description: 'Two strangers find a reason to stay when the city starts to sleep.',
    language: 'English',
    trailerUrl: 'https://example.com/trailer-3'
  },
  {
    id: 'demo-4',
    title: 'Mission Possible',
    vj: 'VJ Ice P',
    genres: ['Action', 'Comedy'],
    year: 2024,
    rating: '4.6',
    poster: 'https://images.unsplash.com/photo-1574267432644-f610f7b8b6fe?auto=format&fit=crop&w=700&q=80',
    description: 'A chaotic crew gets one impossible chance to save the day.',
    language: 'English',
    trailerUrl: 'https://example.com/trailer-4'
  }
];

const demoVjs = [
  { name: 'VJ Ice P', movies: '18 movies', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80' },
  { name: 'VJ Junior', movies: '12 movies', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80' },
  { name: 'VJ Mark', movies: '9 movies', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80' },
  { name: 'VJ Emmy', movies: '15 movies', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80' }
];

const state = {
  movies: [...demoMovies],
  filter: 'All',
  query: '',
};

const grid = document.querySelector('#movieGrid');
const emptyState = document.querySelector('#emptyState');
const searchInput = document.querySelector('#searchInput');
const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modalContent');

function normalizeMovie(movie) {
  const genres = Array.isArray(movie.genres) ? movie.genres : (movie.genre ? [movie.genre] : []);
  return {
    ...movie,
    id: movie.id,
    title: movie.title || 'Untitled Movie',
    vj: movie.vj || 'Great HD',
    genres,
    year: movie.releaseYear || movie.year || new Date().getFullYear(),
    poster: movie.posterUrl || movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80',
    description: movie.description || 'A cinematic movie from the Great HD library.',
    rating: movie.averageRating || movie.rating || 'New',
    language: movie.language || 'English',
    trailerUrl: movie.trailerUrl || ''
  };
}

function movieCard(movie) {
  return `
    <article class="movie-card" data-id="${movie.id}">
      <div class="movie-poster" style="background-image:url('${movie.poster}')"></div>
      <div class="movie-meta">
        <span class="rating">★ ${movie.rating}</span>
        <h3>${movie.title}</h3>
        <p>${movie.vj} · ${movie.genres.join(' / ')} · ${movie.year}</p>
      </div>
    </article>
  `;
}

function renderMovies() {
  const query = state.query.trim().toLowerCase();
  const currentMovies = state.movies.filter((movie) => {
    const matchesFilter = state.filter === 'All' || (movie.genres || []).includes(state.filter);
    const searchTarget = `${movie.title} ${movie.vj} ${(movie.genres || []).join(' ')}`.toLowerCase();
    const matchesQuery = !query || searchTarget.includes(query);
    return matchesFilter && matchesQuery;
  });

  grid.innerHTML = currentMovies.map(movieCard).join('');
  emptyState.hidden = currentMovies.length > 0;

  document.querySelectorAll('.movie-card').forEach((card) => {
    card.addEventListener('click', () => {
      const selected = state.movies.find((movie) => movie.id === card.dataset.id);
      if (selected) {
        openMovieModal(normalizeMovie(selected));
      }
    });
  });
}

function openMovieModal(movie) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modalContent.innerHTML = `
    <p class="eyebrow">${(movie.genres || []).join(' · ')}</p>
    <h2>${movie.title}</h2>
    <p style="color: var(--muted); line-height: 1.7; margin-bottom: 18px;">${movie.description}</p>
    <p><b>${movie.vj}</b> · ${movie.year} · ${movie.language} · ★ ${movie.rating}</p>
    <div class="hero-actions" style="margin-top:22px;">
      <button class="primary-button" data-watch="${movie.trailerUrl || movie.videoUrl || '#'}">▶ Watch movie</button>
      <button class="outline-button" data-download="${movie.downloadUrl || '#'}">↓ Download</button>
    </div>
  `;

  modalContent.querySelector('[data-watch]').addEventListener('click', () => {
    if (movie.trailerUrl || movie.videoUrl) {
      window.open(movie.trailerUrl || movie.videoUrl, '_blank');
    } else {
      alert('Add an authorized movie link in the admin studio to enable playback.');
    }
  });

  modalContent.querySelector('[data-download]').addEventListener('click', () => {
    if (movie.downloadUrl) {
      window.open(movie.downloadUrl, '_blank');
    } else {
      alert('Downloads are only available when enabled by the content owner.');
    }
  });
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function renderVjs() {
  const vjGrid = document.querySelector('#vjGrid');
  vjGrid.innerHTML = demoVjs.map((vj) => `
    <article class="vj-card" style="background-image:url('${vj.image}')">
      <div>
        <small>VJ collection</small>
        <h3>${vj.name}</h3>
        <span>${vj.movies} →</span>
      </div>
    </article>
  `).join('');
}

async function loadMovies() {
  try {
    const response = await fetch('/api/films');
    if (!response.ok) return;
    const data = await response.json();
    const apiMovies = (data.films || []).filter((movie) => movie.isPublished !== false);

    if (apiMovies.length) {
      state.movies = [...apiMovies.map(normalizeMovie), ...demoMovies];
      renderMovies();
    }
  } catch (error) {
    console.info('Using demo mode for Great HD UI.');
  }
}

function bindEvents() {
  document.querySelector('#modalClose').addEventListener('click', closeModal);
  document.querySelector('#searchToggle').addEventListener('click', () => searchInput.focus());

  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderMovies();
  });

  document.querySelectorAll('.filter').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      state.filter = button.dataset.filter;
      renderMovies();
    });
  });

  document.querySelector('#trailerButton').addEventListener('click', () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modalContent.innerHTML = `
      <p class="eyebrow">Great HD preview</p>
      <h2>Stories with a voice.</h2>
      <p style="color: var(--muted); line-height: 1.7;">
        This trailer area is ready to show an authorized preview when a movie trailer URL is connected in the admin dashboard.
      </p>
    `;
  });

  document.querySelector('#loginButton').addEventListener('click', () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modalContent.innerHTML = `
      <p class="eyebrow">Welcome back</p>
      <h2>Sign in to Great HD</h2>
      <form id="loginForm">
        <label for="login-email">Email</label>
        <input id="login-email" type="email" name="email" placeholder="you@example.com" required />

        <label for="login-password">Password</label>
        <input id="login-password" type="password" name="password" placeholder="••••••••" required />

        <button class="primary-button" type="submit">Sign in →</button>
      </form>
      <div id="loginStatus" class="status-message"></div>
    `;

    document.querySelector('#loginForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        email: document.querySelector('#login-email').value,
        password: document.querySelector('#login-password').value
      };

      const status = document.querySelector('#loginStatus');
      status.textContent = 'Signing in...';
      status.className = 'status-message';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Login failed');

        localStorage.setItem('greathd-token', result.token);
        status.textContent = 'Login successful! You can now publish content.';
        status.classList.add('success');
        setTimeout(closeModal, 1200);
      } catch (error) {
        status.textContent = error.message;
        status.classList.add('error');
      }
    });
  });

  document.querySelector('#adminButton').addEventListener('click', () => {
    const token = localStorage.getItem('greathd-token');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    if (!token) {
      modalContent.innerHTML = `
        <p class="eyebrow">Admin access</p>
        <h2>Login required</h2>
        <p style="color: var(--muted); line-height: 1.7;">
          Sign in first to publish a movie, attach a trailer, set genre metadata, and manage downloads.
        </p>
        <button class="primary-button" id="openLoginFromAdmin">Go to sign in →</button>
      `;
      document.querySelector('#openLoginFromAdmin').addEventListener('click', () => document.querySelector('#loginButton').click());
      return;
    }

    modalContent.innerHTML = `
      <p class="eyebrow">Content studio</p>
      <h2>Publish a movie</h2>
      <form id="movieForm">
        <div class="inline-grid">
          <div>
            <label for="movie-title">Movie title</label>
            <input id="movie-title" name="title" required />
          </div>
          <div>
            <label for="movie-vj">VJ</label>
            <input id="movie-vj" name="vj" value="VJ Ice P" required />
          </div>
        </div>

        <label for="movie-description">Description</label>
        <textarea id="movie-description" name="description" required></textarea>

        <div class="inline-grid">
          <div>
            <label for="movie-year">Release year</label>
            <input id="movie-year" name="releaseYear" type="number" value="2026" required />
          </div>
          <div>
            <label for="movie-language">Language</label>
            <input id="movie-language" name="language" value="English" />
          </div>
        </div>

        <div class="inline-grid">
          <div>
            <label for="movie-genres">Genres</label>
            <input id="movie-genres" name="genres" value="Action, Drama" required />
          </div>
          <div>
            <label for="movie-runtime">Runtime (minutes)</label>
            <input id="movie-runtime" name="runtime" type="number" value="120" />
          </div>
        </div>

        <label for="movie-poster-url">Poster URL</label>
        <input id="movie-poster-url" name="posterUrl" placeholder="https://...jpg" />

        <label for="movie-video-url">Movie video URL</label>
        <input id="movie-video-url" name="videoUrl" placeholder="https://...mp4" />

        <label for="movie-download-url">Download URL</label>
        <input id="movie-download-url" name="downloadUrl" placeholder="https://...zip" />

        <label for="movie-trailer-url">Trailer URL</label>
        <input id="movie-trailer-url" name="trailerUrl" placeholder="https://...mp4" />

        <button class="primary-button" type="submit">Save movie →</button>
      </form>
      <div id="movieStatus" class="status-message"></div>
    `;

    document.querySelector('#movieForm').addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      const payload = {
        title: formData.get('title'),
        vj: formData.get('vj'),
        description: formData.get('description'),
        releaseYear: Number(formData.get('releaseYear')),
        language: formData.get('language') || 'English',
        genres: formData.get('genres').split(',').map((item) => item.trim()).filter(Boolean),
        runtime: Number(formData.get('runtime')) || 120,
        posterUrl: formData.get('posterUrl') || '',
        videoUrl: formData.get('videoUrl') || '',
        downloadUrl: formData.get('downloadUrl') || '',
        trailerUrl: formData.get('trailerUrl') || '',
        isPublished: true,
        featured: true
      };

      const status = document.querySelector('#movieStatus');
      status.textContent = 'Publishing movie...';
      status.className = 'status-message';

      try {
        const response = await fetch('/api/films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Could not publish movie');

        status.textContent = 'Movie published successfully.';
        status.classList.add('success');
        setTimeout(() => {
          closeModal();
          loadMovies();
        }, 1200);
      } catch (error) {
        status.textContent = error.message;
        status.classList.add('error');
      }
    });
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
}

renderMovies();
renderVjs();
bindEvents();
loadMovies();
