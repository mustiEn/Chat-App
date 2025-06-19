import * as indexController from "../controllers/index.js";
import { Router } from "express";

const router = Router();

router.post("/login", indexController.login);
router.get("/logout", indexController.logout);

export default router;
