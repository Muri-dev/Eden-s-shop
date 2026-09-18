import { prisma } from "./db";

export interface LogAuditParams {
  adminId?: string;
  adminEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAdminAction(params: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        adminId: params.adminId || null,
        adminEmail: params.adminEmail || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        detailsJson: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
