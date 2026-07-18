import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createBillSchema } from "@/validations/bill.validation";

const prisma = new PrismaClient();

export async function createBill(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;

    const result = createBillSchema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error.issues.map((i) => i.message).join(", ");
      res.status(400).json({ success: false, message: errorMessage });
      return;
    }

    const { shopId, date, items } = result.data;

    const bill = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      for (const item of items) {
        const stock = await tx.stock.findUnique({ where: { id: item.stockId } });
        if (!stock) {
          throw new Error(`Stock item with id ${item.stockId} not found`);
        }
        if (stock.quantity < item.quantity) {
          throw new Error(`Insufficient stock for "${stock.name}". Available: ${stock.quantity}, requested: ${item.quantity}`);
        }
        totalAmount += item.price * item.quantity;
      }

      const createdBill = await tx.bill.create({
        data: {
          shopId,
          date: date ? new Date(date) : new Date(),
          totalAmount,
          createdBy: userId,
          items: {
            create: items.map((item) => ({
              stockId: item.stockId,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
            })),
          },
        },
        include: { items: { include: { stock: true } }, creator: { select: { id: true, fullName: true, role: true } }, shop: true },
      });

      for (const item of items) {
        await tx.stock.update({
          where: { id: item.stockId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      return createdBill;
    });

    res.status(201).json({ success: true, bill });
  } catch (error: any) {
    console.error("Create bill error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create bill" });
  }
}

export async function getBills(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const where = userRole === "OWNER" ? {} : { createdBy: userId };

    const bills = await prisma.bill.findMany({
      where,
      include: {
        items: { include: { stock: { select: { id: true, name: true, unit: true } } } },
        creator: { select: { id: true, fullName: true, role: true } },
        shop: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, bills });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bills" });
  }
}

export async function getBillById(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const billId = parseInt(req.params.id as string);

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        items: { include: { stock: { select: { id: true, name: true, sku: true, unit: true } } } },
        creator: { select: { id: true, fullName: true, role: true } },
        shop: { select: { id: true, name: true } },
      },
    });

    if (!bill) {
      res.status(404).json({ success: false, message: "Bill not found" });
      return;
    }

    if (userRole !== "OWNER" && bill.createdBy !== userId) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({ success: true, bill });
  } catch (error) {
    console.error("Get bill error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bill" });
  }
}

export async function deleteBill(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const billId = parseInt(req.params.id as string);

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { items: true },
    });

    if (!bill) {
      res.status(404).json({ success: false, message: "Bill not found" });
      return;
    }

    if (userRole !== "OWNER" && bill.createdBy !== userId) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (const item of bill.items) {
        await tx.stock.update({
          where: { id: item.stockId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      await tx.bill.delete({ where: { id: billId } });
    });

    res.status(200).json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Delete bill error:", error);
    res.status(500).json({ success: false, message: "Failed to delete bill" });
  }
}
