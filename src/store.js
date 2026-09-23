const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/db.json');

const defaultData = {
  users: [],
  films: [],
  ratings: [],
  reviews: []
};

function ensureDataStore() {
  const directory = path.dirname(DATA_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

function readData() {
  ensureDataStore();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    return defaultData;
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getAverageRating(filmId, ratings) {
  const filmRatings = ratings.filter((entry) => entry.filmId === filmId);

  if (filmRatings.length === 0) {
    return 0;
  }

  const total = filmRatings.reduce((sum, entry) => sum + entry.value, 0);
  return Number((total / filmRatings.length).toFixed(1));
}

module.exports = {
  DATA_FILE,
  defaultData,
  ensureDataStore,
  readData,
  writeData,
  getAverageRating
};
