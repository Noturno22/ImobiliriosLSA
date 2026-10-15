export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  PROPERTY_MANAGER: "PROPERTY_MANAGER",
  AGENT: "AGENT",
  EDITOR: "EDITOR",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Permission = {
  PROPERTY_READ: "property:read",
  PROPERTY_WRITE: "property:write",
  PROPERTY_PUBLISH: "property:publish",
  MEDIA_WRITE: "media:write",
  LEAD_READ: "lead:read",
  LEAD_WRITE: "lead:write",
  LEAD_ASSIGN: "lead:assign",
  APPOINTMENT_READ: "appointment:read",
  APPOINTMENT_WRITE: "appointment:write",
  USER_MANAGE: "user:manage",
  AUDIT_READ: "audit:read",
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

/** Role -> permission matrix. Public visitors receive NO administrative permissions. */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: Object.values(Permission),
  ADMIN: [
    Permission.PROPERTY_READ,
    Permission.PROPERTY_WRITE,
    Permission.PROPERTY_PUBLISH,
    Permission.MEDIA_WRITE,
    Permission.LEAD_READ,
    Permission.LEAD_WRITE,
    Permission.LEAD_ASSIGN,
    Permission.APPOINTMENT_READ,
    Permission.APPOINTMENT_WRITE,
    Permission.USER_MANAGE,
    Permission.AUDIT_READ,
  ],
  PROPERTY_MANAGER: [
    Permission.PROPERTY_READ,
    Permission.PROPERTY_WRITE,
    Permission.PROPERTY_PUBLISH,
    Permission.MEDIA_WRITE,
    Permission.LEAD_READ,
  ],
  AGENT: [
    Permission.PROPERTY_READ,
    Permission.LEAD_READ,
    Permission.LEAD_WRITE,
    Permission.APPOINTMENT_READ,
    Permission.APPOINTMENT_WRITE,
  ],
  EDITOR: [Permission.PROPERTY_READ, Permission.PROPERTY_WRITE, Permission.MEDIA_WRITE],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
