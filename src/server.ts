import "dotenv/config"

import express from "express";
import cors from "cors";
import connectToDB from "./config/db";
import {APP_ORIGIN, NODE_ENV, PORT} from "./constants/env";
import cookieParser from "cookie-parser";
import {OK} from "./constants/http";
import authRoutes from "./routes/auth.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: APP_ORIGIN,
  credentials: true,
}));
app.use(cookieParser());

app.get("/", async (req, res, next) => {
  try {
    res.status(OK).json({
      status: "ok",
    })
  } catch (error) {
    next(error)
  }
});

app.use("/auth", authRoutes);

app.listen(PORT, async () => {

  console.log(`Server running on port ${PORT} in ${NODE_ENV}`);
  await connectToDB();
})