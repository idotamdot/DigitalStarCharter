import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { workOrders } from "@shared/operating-schema";
import { evaluateWorkQualityGate } from "./quality-service";

export async function enforceQualityBeforeCompletion(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "PATCH" || !/^\/api\/operating\/work\/\d+\/status\/?$/.test(req.path)) return next();

  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || !("status" in body) || body.status !== "completed") return next();

  const match = req.path.match(/^\/api\/operating\/work\/(\d+)\/status\/?$/);
  const workOrderId = match ? Number(match[1]) : NaN;
  if (!Number.isInteger(workOrderId) || workOrderId <= 0) return res.status(400).json({ message: "Invalid work order id" });

  const [work] = await db.select().from(workOrders).where(eq(workOrders.id, workOrderId)).limit(1);
  if (!work) return res.status(404).json({ message: "Work order not found" });

  const gate = await evaluateWorkQualityGate(workOrderId, work.revenueType);
  if (!gate.clear) {
    return res.status(409).json({
      message: "Work cannot be completed until all release-blocking quality standards pass or receive an administrator waiver.",
      qualityGate: gate,
    });
  }

  next();
}
