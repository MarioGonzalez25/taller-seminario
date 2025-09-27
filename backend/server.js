  import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import tasksRouter from "./routes/tasks.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/tasks", tasksRouter);

const PORT = process.env.PORT || 5000;
app.get("/", (_, res) => {
  res.type("text").send("Taskmaster API running. Try /health or /api/tasks");
});

async function start() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Falta MONGO_URI en .env");
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || "taskmaster" });
  app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
}

// Evita levantar servidor durante tests
if (process.env.JEST_WORKER_ID === undefined) start();

export default app;
