import { Router } from "express";
import { AuthController } from "./authController";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginValidation, registerValidation } from "./authValidations";

const router = Router();

router.post("/register", validateRequest(registerValidation), AuthController.register);
router.post("/login", validateRequest(loginValidation), AuthController.login);

export default router;