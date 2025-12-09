const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

// Only start server if run directly (not during test imports)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
  });
}

module.exports = app;
