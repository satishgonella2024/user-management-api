// src/models/interfaces/rolePermission.interface.ts
export interface IRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: Date;
  updatedAt: Date;
}