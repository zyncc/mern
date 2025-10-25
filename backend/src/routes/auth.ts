import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller";

const router = Router()

router.post("/signup", (req, res) => signup(req, res))

router.post("/signin", (req, res) => signin(req, res))

export default router