import "dotenv/config";
import express from "express";
import router from "./routes";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());

app.use("/api", router);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
