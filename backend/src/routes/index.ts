import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import shopRoutes from "@/routes/shop.routes";
import stockRoutes from "@/routes/stock.routes";
import billRoutes from "@/routes/bill.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/shops", shopRoutes);
router.use("/stocks", stockRoutes);
router.use("/bills", billRoutes);

export default router;
