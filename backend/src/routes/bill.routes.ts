import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { createBill, getBills, getBillById, deleteBill } from "@/controllers/bill.controller";

const router = Router();

router.use(authenticate);

router.post("/", createBill);
router.get("/", getBills);
router.get("/:id", getBillById);
router.delete("/:id", deleteBill);

export default router;
