const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/db.json');

function loadDatabase() {
  if (!fs.existsSync(DATA_PATH)) {
    return { users: [], films: [], ratings: [], reviews: [] };
  }

  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { users: [], films: [], ratings: [], reviews: [] };
  }
}

module.exports = {
  loadDatabase
};
