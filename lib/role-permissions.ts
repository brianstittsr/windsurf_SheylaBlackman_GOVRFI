/**
 * Role-Based Access Control (RBAC) Permissions
 * 
 * Defines user roles, their permissions, and data filtering utilities.
 */

export type UserRole = "superadmin" | "admin" | "team_member" | "affiliate" | "consultant" | "customer" | "viewer";

export interface RolePermissions {
  canViewAllData: boolean;
  canViewAssignedOnly: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canEditSuperAdmin: boolean;
  canChangeUserRoles: boolean;
  canPromoteToSuperAdmin: boolean;
  canManagePlatformSettings: boolean;
  canAccessAdminPanel: boolean;
  canManageFeatureVisibility: boolean;
  canViewAsOtherRoles: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  team_member: "Team Member",
  affiliate: "Affiliate",
  consultant: "Consultant",
  customer: "Customer",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  superadmin: "Full platform access, can modify all users and settings, can view as any role",
  admin: "Can see all data, modify users (except SuperAdmin), manage most settings",
  team_member: "Internal team, can see all projects, create content",
  affiliate: "External partner, sees only assigned content",
  consultant: "External consultant, sees only assigned content",
  customer: "External customer, sees only their own projects",
  viewer: "Read-only access to assigned content",
};

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  superadmin: {
    canViewAllData: true,
    canViewAssignedOnly: false,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canEditSuperAdmin: true,
    canChangeUserRoles: true,
    canPromoteToSuperAdmin: true,
    canManagePlatformSettings: true,
    canAccessAdminPanel: true,
    canManageFeatureVisibility: true,
    canViewAsOtherRoles: true,
  },
  admin: {
    canViewAllData: true,
    canViewAssignedOnly: false,
    canCreateUsers: true,
    canEditUsers: false, // Admin can only edit newly created documents, not existing users
    canDeleteUsers: false, // Admin cannot delete users
    canEditSuperAdmin: false,
    canChangeUserRoles: false, // Admin cannot change roles
    canPromoteToSuperAdmin: false,
    canManagePlatformSettings: false, // Only SuperAdmin can change settings
    canAccessAdminPanel: true,
    canManageFeatureVisibility: false,
    canViewAsOtherRoles: false,
  },
  team_member: {
    canViewAllData: true,
    canViewAssignedOnly: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canEditSuperAdmin: false,
    canChangeUserRoles: false,
    canPromoteToSuperAdmin: false,
    canManagePlatformSettings: false,
    canAccessAdminPanel: false,
    canManageFeatureVisibility: false,
    canViewAsOtherRoles: false,
  },
  affiliate: {
    canViewAllData: false,
    canViewAssignedOnly: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canEditSuperAdmin: false,
    canChangeUserRoles: false,
    canPromoteToSuperAdmin: false,
    canManagePlatformSettings: false,
    canAccessAdminPanel: false,
    canManageFeatureVisibility: false,
    canViewAsOtherRoles: false,
  },
  consultant: {
    canViewAllData: false,
    canViewAssignedOnly: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canEditSuperAdmin: false,
    canChangeUserRoles: false,
    canPromoteToSuperAdmin: false,
    canManagePlatformSettings: false,
    canAccessAdminPanel: false,
    canManageFeatureVisibility: false,
    canViewAsOtherRoles: false,
  },
  customer: {
    canViewAllData: false,
    canViewAssignedOnly: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canEditSuperAdmin: false,
    canChangeUserRoles: false,
    canPromoteToSuperAdmin: false,
    canManagePlatformSettings: false,
    canAccessAdminPanel: false,
    canManageFeatureVisibility: false,
    canViewAsOtherRoles: false,
  },
  viewer: {
    canViewAllData: false,
    canViewAssignedOnly: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canEditSuperAdmin: false,
    canChangeUserRoles: false,
    canPromoteToSuperAdmin: false,
    canManagePlatformSettings: false,
    canAccessAdminPanel: false,
    canManageFeatureVisibility: false,
    canViewAsOtherRoles: false,
  },
};

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: string): RolePermissions {
  return ROLE_PERMISSIONS[role as UserRole] || ROLE_PERMISSIONS.viewer;
}

/**
 * Check if a user with editorRole can edit a user with targetRole
 */
export function canEditUser(editorRole: string, targetRole: string): boolean {
  const permissions = getRolePermissions(editorRole);
  if (!permissions.canEditUsers) return false;
  if (targetRole === "superadmin") return permissions.canEditSuperAdmin;
  return true;
}

/**
 * Check if a user with editorRole can delete a user with targetRole
 */
export function canDeleteUser(editorRole: string, targetRole: string): boolean {
  const permissions = getRolePermissions(editorRole);
  if (!permissions.canDeleteUsers) return false;
  if (targetRole === "superadmin") return permissions.canEditSuperAdmin;
  return true;
}

/**
 * Check if a user with editorRole can change another user's role to newRole
 */
export function canChangeRole(editorRole: string, currentRole: string, newRole: string): boolean {
  const permissions = getRolePermissions(editorRole);
  if (!permissions.canChangeUserRoles) return false;
  
  // Cannot modify SuperAdmin unless you have permission
  if (currentRole === "superadmin" && !permissions.canEditSuperAdmin) return false;
  
  // Cannot promote to SuperAdmin unless you have permission
  if (newRole === "superadmin" && !permissions.canPromoteToSuperAdmin) return false;
  
  return true;
}

/**
 * Get all roles that a user can assign to others
 */
export function getAssignableRoles(editorRole: string): UserRole[] {
  const permissions = getRolePermissions(editorRole);
  if (!permissions.canChangeUserRoles) return [];
  
  const allRoles: UserRole[] = ["superadmin", "admin", "team_member", "affiliate", "consultant", "customer", "viewer"];
  
  if (permissions.canPromoteToSuperAdmin) {
    return allRoles;
  }
  
  // Cannot assign SuperAdmin role
  return allRoles.filter(role => role !== "superadmin");
}

/**
 * Filter data based on user role and assignments
 * 
 * @param data - Array of data items to filter
 * @param userRole - The user's role
 * @param userId - The user's ID
 * @param assignmentField - Field name for assigned users (default: "assignedTo")
 * @param ownerField - Field name for owner (default: "ownerId")
 */
export function filterDataByRole<T extends Record<string, unknown>>(
  data: T[],
  userRole: string,
  userId: string,
  assignmentField: string = "assignedTo",
  ownerField: string = "ownerId"
): T[] {
  const permissions = getRolePermissions(userRole);
  
  // Users who can view all data get everything
  if (permissions.canViewAllData) return data;
  
  // Users who can only view assigned content
  if (permissions.canViewAssignedOnly) {
    return data.filter((item) => {
      // Check if user is the owner
      if (item[ownerField] === userId) return true;
      
      // Check if user is in assigned list
      const assigned = item[assignmentField];
      if (Array.isArray(assigned) && assigned.includes(userId)) return true;
      
      // Check affiliate-specific fields
      if (item.affiliateId === userId) return true;
      if (item.customerId === userId) return true;
      if (item.consultantId === userId) return true;
      
      // Check team member assignments
      const teamIds = item.teamIds;
      if (Array.isArray(teamIds) && teamIds.includes(userId)) return true;
      
      return false;
    });
  }
  
  // Default: return empty array for users with no data access
  return [];
}

/**
 * Check if a role is considered an "internal" role (can see more data)
 */
export function isInternalRole(role: string): boolean {
  return ["superadmin", "admin", "team_member"].includes(role);
}

/**
 * Check if a role is considered an "external" role (limited data access)
 */
export function isExternalRole(role: string): boolean {
  return ["affiliate", "consultant", "customer", "viewer"].includes(role);
}

/**
 * Get the hierarchy level of a role (higher = more permissions)
 */
export function getRoleHierarchy(role: string): number {
  const hierarchy: Record<string, number> = {
    superadmin: 100,
    admin: 80,
    team_member: 60,
    affiliate: 40,
    consultant: 40,
    customer: 20,
    viewer: 10,
  };
  return hierarchy[role] || 0;
}

/**
 * Check if roleA has higher or equal hierarchy than roleB
 */
export function hasHigherOrEqualRole(roleA: string, roleB: string): boolean {
  return getRoleHierarchy(roleA) >= getRoleHierarchy(roleB);
}
