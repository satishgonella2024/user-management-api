/**
 * Enum representing all available permissions in the system
 */
export enum Permission {
  // User management permissions
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
  
  // User profile permissions
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',
  
  // Admin-specific permissions
  READ_ALL_USERS = 'read:all_users',
  UPDATE_ANY_USER = 'update:any_user',
  DELETE_ANY_USER = 'delete:any_user',
  ASSIGN_ROLES = 'assign:roles'
}