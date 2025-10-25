import { Router } from "express";
import {
  CreateAgent,
  GetAgents,
  GetTasks,
  GetTasksByAgent,
  ProcessList,
} from "../controllers/admin.controller";
import { isAuthenticated } from "../middleware/authentication";
import multer from "multer";

const router = Router();
router.use(isAuthenticated);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/agent", CreateAgent);
router.get("/agent", GetAgents);
router.get("/tasks", GetTasks);
router.get("/tasks/:agentId", GetTasksByAgent);

router.post("/tasks", upload.single("file"), ProcessList);

export default router;
