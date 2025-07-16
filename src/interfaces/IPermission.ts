// src/models/interfaces/permission.interface.ts
export interface IPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  createdAt: Date;
  updatedAt: Date;
}