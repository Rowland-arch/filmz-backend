require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: authRoutes, ensureAdminAccount } = require('./src/routes/auth');
const filmRoutes = require('./src/routes/films');
const { ensureDataStore } = require('./src/store');
const app = express();
const PORT = process.env.PORT || 5000;
ensureDataStore();
app.use(cors()); app.use(express.json({ limit: '2mb' })); app.use(express.urlencoded({ extended: true })); app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Great HD' }));
app.use('/api/auth', authRoutes); app.use('/api/films', filmRoutes);
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
if (require.main === module) { ensureAdminAccount().then(() => app.listen(PORT, () => console.log(`Great HD listening on http://localhost:${PORT}`))); }
module.exports = app;
