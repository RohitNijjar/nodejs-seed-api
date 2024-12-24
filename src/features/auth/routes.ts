import { Router } from "express";
import { AuthController } from "./controller";
import authMiddleware from "../../middlewares/auth";

const router = Router();

router.post("/register", authMiddleware, AuthController.register);

export default router;