// src/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./controllers/authController";
import adminRoutes from "./controllers/adminController";
import syncRoutes from "./controllers/syncController";
import appointmentsController from "./controllers/appointmentsController";
import specializationsController from "./controllers/specializationsController";

dotenv.config();
const PORT = Number(process.env.PORT || 4000);
const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/login", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sync", syncRoutes);
app.use("/appointments", appointmentsController);
app.use("/specializations", specializationsController);

app.get("/", (req, res) =>
  res.send({ ok: true, service: "mediconsult-backend" })
);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
