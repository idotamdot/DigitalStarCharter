import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { workOrders, type WorkOrderStatus } from "@shared/operating-schema";
import { evaluateGoodnessGate } from "./goodness-service";

const gatedStatuses = new Set<WorkOrderStatus>(["ready", "in_progress", "human_review", "completed"]);

export async function enforceGoodnessBeforeProduction(req: Request, res: Response, next: NextFunction) {
  if (!req.member) return next();

  if (req.method === "POST" && /^\/api\/operating\/work\/?$/.test(req.path)) {
    const body: unknown = req.body;
    if (typeof body === "object" && body !== null && "status" in body && body.status !== undefined && body.status !== "planned") {
      return res.status(409).json({
        message: "New work must begin in planned status. It may not enter production until the Goodness Gate passes.",
      });
    }
    return next();
  }

  if (req.method !== "PATCH" || !/^\/api\/operating\/work\/\d+\/status\/?$/.test(req.path)) return next();

  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || !("status" in body) || typeof body.status !== "string") return next();
  if (!gatedStatuses.has(body.status as WorkOrderStatus)) return next();

  const match = req.path.match(/^\/api\/operating\/work\/(\d+)\/status\/?$/);
  const workOrderId = match ? Number(match[1]) : NaN;
  if (!Number.isInteger(workOrderId) || workOrderId <= 0) return res.status(400).json({ message: "Invalid work order id" });

  const [work] = await db.select({ id: workOrders.id }).from(workOrders).where(eq(workOrders.id, workOrderId)).limit(1);
  if (!work) return res.status(404).json({ message: "Work order not found" });

  const gate = await evaluateGoodnessGate(workOrderId);
  if (!gate.clear) {
    return res.status(409).json({
      message: "Goodness Gate blocked this work from entering production. Every active Goodness criterion must pass; core criteria are not waivable.",
      goodnessGate: gate,
    });
  }
  next();
}
