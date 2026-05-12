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

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:1234",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/sessions", gameSessionRoutes);
app.use("/api/daily-challenge", dailyChallengeRoutes);
app.use("/api/ai-coach", aiCoachRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
};

startServer();
