import { Router } from "express";
import { getUserHandler } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";

const userRoutes = Router();

userRoutes.get("/", authenticate, getUserHandler);

export default userRoutes;
