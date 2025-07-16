/**
 * Interface defining the structure of role-based permissions
 */
export interface RolePermissions {
  [Role.ADMIN]: Permission[];
  [Role.USER]: Permission[];
  [Role.GUEST]: Permission[];
}