const express = require("express");
const { getMeasurementsCollection } = require("./db");

const app = express();
const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || "*";

const TEMP_THRESHOLD = Number(process.env.TEMP_THRESHOLD ?? 18);

const deriveStatus = (temperature) => {
  if (Number.isNaN(temperature)) {
    return { status: "too cold", message: "Invalid temperature reading." };
  }

  if (temperature < TEMP_THRESHOLD) {
    return {
      status: "too cold",
      message: "It is too cold, you should turn on the heater.",
    };
  }

  if (temperature > TEMP_THRESHOLD) {
    return {
      status: "too warm",
      message: "It is too warm, you should turn off the heater.",
    };
  }

  return { status: "just right", message: "Temperature is just right." };
};

// Allow browser clients (e.g., the Vue frontend) to call this API directly.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", corsOrigin);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

app.get("/api/temperature", async (req, res) => {
  try {
    const collection = await getMeasurementsCollection();

    const measurement =
      (await collection.find().sort({ timestamp: -1 }).limit(1).next()) || null;

    if (!measurement) {
      return res.status(404).json({ message: "No measurements found" });
    }

    const temperature = Number(measurement.temperature);
    const timestamp = measurement.timestamp
      ? new Date(measurement.timestamp).toISOString()
      : null;
    const { status, message } = deriveStatus(temperature);

    return res.json({
      temperature,
      humidity: measurement.humidity ?? null,
      timestamp,
      sensorId: measurement.sensorId ?? null,
      status,
      message,
    });
  } catch (error) {
    console.error("Failed to fetch latest measurement", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch temperature data" });
  }
});

// Only start server if run directly (not during test imports)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
  });
}

module.exports = app;
