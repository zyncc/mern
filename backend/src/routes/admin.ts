import { Router } from "express";
import { CreateAgent, ProcessList } from "../controllers/admin.controller";
import { isAuthenticated } from "../middleware/authentication";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/agent", isAuthenticated, CreateAgent);
router.post("/tasks", isAuthenticated, upload.single("file"), ProcessList);

export default router;
