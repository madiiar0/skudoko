import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "../db/connectDB.js";
import aiCoachRoutes from "../routes/aiCoach.route.js";
import authRoutes from "../routes/auth.route.js";
import dailyChallengeRoutes from "../routes/dailyChallenge.route.js";
import gameSessionRoutes from "../routes/gameSession.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5173;
let dbConnectionPromise = null;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:1234")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const connectOnce = () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB().catch((error) => {
      dbConnectionPromise = null;
      throw error;
    });
  }

  return dbConnectionPromise;
};

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/$/, "");
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Sudoko API is running" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api", async (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  try {
    await connectOnce();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", gameSessionRoutes);
app.use("/api/daily-challenge", dailyChallengeRoutes);
app.use("/api/ai-coach", aiCoachRoutes);

const startServer = async () => {
  await connectOnce();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
