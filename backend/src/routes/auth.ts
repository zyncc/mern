import { Router } from "express";
import { getSession, signin, signup } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/get-session", getSession);

export default router;
