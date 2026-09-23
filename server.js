const app = require('./server');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Filmz backend listening on http://localhost:${PORT}`);
});
